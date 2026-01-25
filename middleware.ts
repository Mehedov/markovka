import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
	const token = request.cookies.get('auth_token')
	const { pathname } = request.nextUrl

	// Если токен есть и пользователь идет на логин/регистрацию — кидаем в админку
	if (token && (pathname === '/login' || pathname === '/register')) {
		return NextResponse.redirect(new URL('/management', request.url))
	}

	// Защита админки
	if (pathname.startsWith('/management') && !token) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	return NextResponse.next()
}
