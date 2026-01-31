import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	})

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return request.cookies.get(name)?.value
				},
				set(name: string, value: string, options: CookieOptions) {
					request.cookies.set({ name, value, ...options })
					response = NextResponse.next({
						request: { headers: request.headers },
					})
					response.cookies.set({ name, value, ...options })
				},
				remove(name: string, options: CookieOptions) {
					request.cookies.set({ name, value: '', ...options })
					response = NextResponse.next({
						request: { headers: request.headers },
					})
					response.cookies.set({ name, value: '', ...options })
				},
			},
		},
	)

	const {
		data: { user },
	} = await supabase.auth.getUser()

	// 1. Если пользователь вообще не залогинен — кидаем на логин
	if (
		!user &&
		(request.nextUrl.pathname.startsWith('/management') ||
			request.nextUrl.pathname === '/')
	) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	// 2. БЛОКИРОВКА УЧИТЕЛЕЙ:
	// Проверяем роль в метаданных. Если путь начинается на /management, а роль не 'admin'
	if (request.nextUrl.pathname.startsWith('/management')) {
		const role = user?.app_metadata?.role

		if (role !== 'admin') {
			// Если это учитель (или кто-то еще без роли админа),
			// выкидываем его на главную страницу посещаемости
			return NextResponse.redirect(new URL('/', request.url))
		}
	}

	return response
}

export const config = {
	matcher: ['/', '/management/:path*'],
}
