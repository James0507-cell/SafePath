'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/src/lib/supabaseClient'

function AuthCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const next = searchParams.get('next') ?? '/'

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          router.push(next)
          return
        }
      }

      // If no code or error, check if we already have a session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push(next)
      } else {
        router.push('/login?error=Could not authenticate user')
      }
    }

    handleCallback()
  }, [searchParams, router, supabase.auth])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-zinc-600 dark:text-zinc-400">Completing sign in...</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-zinc-300 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      }>
        <AuthCallbackHandler />
      </Suspense>
    </div>
  )
}
