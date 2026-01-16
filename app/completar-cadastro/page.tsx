import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import OnboardingForm from './OnboardingForm'

export default async function OnboardingPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  return <OnboardingForm user={user} />
}
