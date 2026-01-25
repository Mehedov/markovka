import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
	try {
		const { username, password } = await req.json()

		const userExists = db.users.find(u => u.username === username)
		if (userExists) {
			return NextResponse.json(
				{ error: 'Пользователь уже существует' },
				{ status: 400 },
			)
		}

		const newUser = { id: Date.now().toString(), username, password }
		db.users.push(newUser)

		return NextResponse.json({ success: true })
	} catch (error) {
		return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
	}
}
