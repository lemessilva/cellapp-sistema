import { getUser } from '@/lib/auth'
import ProfileScreen from '@/components/ProfileScreen'
import { redirect } from 'next/navigation'
import { getPrayerReportData } from '@/app/actions/report'

export default async function ProfilePage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const { data: reportData } = await getPrayerReportData()

  return <ProfileScreen user={user} reportData={reportData} />
}
