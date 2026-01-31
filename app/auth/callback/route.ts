import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
	const requestUrl = new URL(request.url) // Исправляем ошибку ts(2345)
	const code = requestUrl.searchParams.get('code')
	const next = requestUrl.searchParams.get('next') ?? '/management'

	if (code) {
		const cookieStore = await cookies() // Добавляем await для Next.js 15

		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				cookies: {
					// Теперь ошибки ts(2339) исчезнут, так как cookieStore уже разрешен
					get(name: string) {
						return cookieStore.get(name)?.value
					},
					set(name: string, value: string, options: CookieOptions) {
						cookieStore.set({ name, value, ...options })
					},
					remove(name: string, options: CookieOptions) {
						cookieStore.delete({ name, ...options })
					},
				},
			},
		)

		const { error } = await supabase.auth.exchangeCodeForSession(code)

		if (!error) {
			return NextResponse.redirect(`${requestUrl.origin}${next}`)
		}
	}

	// В случае ошибки возвращаем на логин
	return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`)
}
