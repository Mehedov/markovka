import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
	let response = NextResponse.next({
		request: { headers: request.headers },
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
					// Устанавливаем в запрос, чтобы серверные компоненты видели актуальную сессию
					request.cookies.set({ name, value, ...options })
					// Устанавливаем в ответ, чтобы браузер сохранил куку
					response.cookies.set({ name, value, ...options })
				},
				remove(name: string, options: CookieOptions) {
					request.cookies.set({ name, value: '', ...options })
					response.cookies.set({ name, value: '', ...options })
				},
			},
		},
	)

	const {
		data: { user },
	} = await supabase.auth.getUser()

	const isManagementPath = request.nextUrl.pathname.startsWith('/management')
	const isRootPath = request.nextUrl.pathname === '/'

	// 1. Защита: Если нет юзера, а он лезет в закрытую зону
	if (!user && (isManagementPath || isRootPath)) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	// 2. Ролевая модель: Только админ в /management
	if (isManagementPath) {
		const role = user?.app_metadata?.role
		if (role !== 'admin') {
			return NextResponse.redirect(new URL('/', request.url))
		}
	}

	return response
}

export const config = {
	matcher: ['/', '/management/:path*'],
}
