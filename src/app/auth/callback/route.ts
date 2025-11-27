import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Sync user data to Prisma database immediately after successful login
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          console.log(
            'OAuth callback - User metadata:',
            JSON.stringify(user.user_metadata, null, 2)
          )
          console.log('OAuth callback - User identities:', JSON.stringify(user.identities, null, 2))

          // Extract name and avatar from various possible sources
          const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.identities?.[0]?.identity_data?.full_name ||
            user.identities?.[0]?.identity_data?.name ||
            null

          const avatarUrl =
            user.user_metadata?.avatar_url ||
            user.user_metadata?.picture ||
            user.identities?.[0]?.identity_data?.avatar_url ||
            user.identities?.[0]?.identity_data?.picture ||
            null

          await prisma.user.upsert({
            where: { id: user.id },
            update: {
              email: user.email!,
              name,
              avatarUrl,
            },
            create: {
              id: user.id,
              email: user.email!,
              name,
              avatarUrl,
            },
          })

          console.log('OAuth callback - User synced:', {
            id: user.id,
            email: user.email,
            name,
            avatarUrl,
          })
        }
      } catch (syncError) {
        // Don't fail the login if sync fails, just log it
        console.error('Error syncing user data:', syncError)
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
