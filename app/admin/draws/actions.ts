'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper to generate 5 unique random numbers between 1 and 45
function generateDrawNumbers(): number[] {
  const numbers = new Set<number>()
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1)
  }
  return Array.from(numbers).sort((a, b) => a - b)
}

export async function runDrawAndPublish() {
  const supabase = await createClient()

  // Ensure caller is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') return { error: 'Forbidden' }

  const drawNumbers = generateDrawNumbers()

  // Calculate total prize pool based on active subscriptions ($10/mo = $5 to pool, or something similar. For now just 50% of revenue goes to pool)
  let totalPool = 0
  const { data: subs } = await supabase.from('subscriptions').select('plan').eq('status', 'active')
  if (subs) {
    const monthlySubs = subs.filter(s => s.plan === 'monthly').length
    const yearlySubs = subs.filter(s => s.plan === 'yearly').length
    // Assume $10 monthly, $96 yearly. 50% pot contribution.
    const monthlyRevenue = monthlySubs * 10
    const yearlyRevenueDist = (yearlySubs * 96) / 12 // distributed monthly
    totalPool = (monthlyRevenue + yearlyRevenueDist) * 0.5
  }

  // Create the draw entry
  const { data: drawEntry, error: drawErr } = await supabase.from('draws').insert({
    draw_date: new Date().toISOString(),
    result_numbers: drawNumbers,
    status: 'completed',
    total_prize_pool: totalPool,
  }).select('*').single()

  if (drawErr || !drawEntry) return { error: drawErr?.message || 'Failed to create draw' }

  // Fetch all user scores to find winners
  // We need to group scores by user, taking only their latest 5
  // Note: the DB trigger already enforces max 5 rows per user
  const { data: allScores } = await supabase.from('scores').select('user_id, score')
  
  const userScoresMap = new Map<string, Set<number>>()
  if (allScores) {
    for (const row of allScores) {
      if (!userScoresMap.has(row.user_id)) {
        userScoresMap.set(row.user_id, new Set())
      }
      userScoresMap.get(row.user_id)!.add(row.score)
    }
  }

  // Match tiers
  const match5Winners: string[] = []
  const match4Winners: string[] = []
  const match3Winners: string[] = []

  const drawSet = new Set(drawNumbers)

  for (const [userId, userScores] of userScoresMap.entries()) {
    let matchCount = 0
    for (const score of userScores) {
      if (drawSet.has(score)) matchCount++
    }
    
    if (matchCount === 5) match5Winners.push(userId)
    else if (matchCount === 4) match4Winners.push(userId)
    else if (matchCount === 3) match3Winners.push(userId)
  }

  // Calculate payouts
  // 40% for match 5, 35% for match 4, 25% for match 3
  const pool5 = totalPool * 0.40
  const pool4 = totalPool * 0.35
  const pool3 = totalPool * 0.25

  const payout5 = match5Winners.length > 0 ? pool5 / match5Winners.length : 0
  const payout4 = match4Winners.length > 0 ? pool4 / match4Winners.length : 0
  const payout3 = match3Winners.length > 0 ? pool3 / match3Winners.length : 0

  // Insert winners
  const winnersToInsert = [
    ...match5Winners.map(uid => ({ draw_id: drawEntry.id, user_id: uid, match_count: 5, prize_amount: payout5 })),
    ...match4Winners.map(uid => ({ draw_id: drawEntry.id, user_id: uid, match_count: 4, prize_amount: payout4 })),
    ...match3Winners.map(uid => ({ draw_id: drawEntry.id, user_id: uid, match_count: 3, prize_amount: payout3 }))
  ]

  if (winnersToInsert.length > 0) {
    await supabase.from('winners').insert(winnersToInsert)
  }

  revalidatePath('/admin/draws')
  revalidatePath('/admin')
  revalidatePath('/dashboard')
  
  return { success: true, drawNumbers, winnersCount: winnersToInsert.length }
}
