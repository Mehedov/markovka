import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
	return NextResponse.json(db.attendance)
}

export async function PATCH(req: Request) {
	const { key, status } = await req.json()
	db.attendance[key] = status
	return NextResponse.json({ success: true })
}
