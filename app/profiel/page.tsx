import { requireAuth, getUserProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/SignOutButton'
import { PageSection } from '@/components/PageSection'
import { PageContainer } from '@/components/PageContainer'
import { PageTitle } from '@/components/PageTitle'
import { Footer } from '@/components/Footer'
import { BackgroundImage } from '@/components/BackgroundImage'

export const dynamic = 'force-dynamic'

export default async function ProfielPage() {
  const user = await requireAuth()
  const userProfile = await getUserProfile()

  if (!userProfile) {
    redirect('/')
  }

  return (
    <div className="page-background">
      <BackgroundImage />
      <PageSection className="min-h-screen">
        <PageContainer maxWidth="4xl">
          <PageTitle>Mijn Profiel</PageTitle>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 card-hover">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{userProfile.full_name || user.email}</h2>
              </div>
              
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-lg text-gray-800 font-medium">{user.email}</p>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-sm text-gray-600 mb-1">Naam</p>
                  <p className="text-lg text-gray-800 font-medium">{userProfile.full_name || 'Niet ingevuld'}</p>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-sm text-gray-600 mb-1">Rol</p>
                  <p className="text-lg text-gray-800 font-medium capitalize">{userProfile.role || 'user'}</p>
                </div>
              </div>
              
              <div className="pt-6">
                <SignOutButton />
              </div>
            </div>
          </div>
        </PageContainer>
      </PageSection>
      <Footer />
    </div>
  )
}
