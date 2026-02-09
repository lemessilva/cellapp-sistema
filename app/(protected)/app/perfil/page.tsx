import { getUser } from '@/lib/auth'
import ProfileScreen from '@/components/ProfileScreen'
import { redirect } from 'next/navigation'
import { getPrayerReportData } from '@/app/actions/report'
import { getGrowthSteps, getMemberProgress } from '@/app/actions/growth-track'

export default async function ProfilePage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const { data: reportData } = await getPrayerReportData()
  const growthSteps = await getGrowthSteps()
  const userProgress = await getMemberProgress(user.id)

  return <ProfileScreen user={user} reportData={reportData} growthSteps={growthSteps} userProgress={userProgress} />
}
