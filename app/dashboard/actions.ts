'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitScore(formData: FormData) {
  const score = parseInt(formData.get('score') as string)
  const date = formData.get('date') as string

  if (isNaN(score) || score < 1 || score > 45 || !date) {
    return { error: 'Invalid score or date. Score must be between 1 and 45.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('scores').insert({
    user_id: user.id,
    score,
    played_at: date,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/scores')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function selectCharity(formData: FormData) {
  const charityId = formData.get('charityId') as string
  const percentage = parseInt(formData.get('percentage') as string)

  if (!charityId || isNaN(percentage) || percentage < 10 || percentage > 100) {
    return { error: 'Invalid selection or percentage (min 10%).' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('user_charity').upsert({
    user_id: user.id,
    charity_id: charityId,
    contribution_percentage: percentage,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/charity')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function manageSubscription(formData: FormData) {
  const plan = formData.get('plan') as string // 'monthly' or 'yearly'
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Mocking the payment flow. In a real app we'd create a Stripe Checkout session.
  // We'll just directly activate the subscription here.
  const now = new Date()
  const endDate = new Date()
  if (plan === 'yearly') endDate.setFullYear(now.getFullYear() + 1)
  else endDate.setMonth(now.getMonth() + 1)

  const { error } = await supabase.from('subscriptions').upsert({
    user_id: user.id,
    plan,
    status: 'active',
    current_period_start: now.toISOString(),
    current_period_end: endDate.toISOString(),
  }, { onConflict: 'user_id' })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/subscribe')
  revalidatePath('/dashboard')
  return { success: true }
}
