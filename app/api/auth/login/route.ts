import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
	const { username, password } = await req.json()

	// Имитация проверки (логин: admin, пароль: admin)
	if (username === 'admin' && password === 'admin') {
		const cookieStore = await cookies()

		// Устанавливаем HTTP-only куку (ее нельзя украсть через JS)
		cookieStore.set('auth_token', 'secret_session_token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24, // 1 день
			path: '/',
		})

		return NextResponse.json({ success: true })
	}

	return NextResponse.json({ error: 'Неверные данные' }, { status: 401 })
}
