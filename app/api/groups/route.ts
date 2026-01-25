import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
	return NextResponse.json(db.groups)
}

export async function POST(req: Request) {
	const { name } = await req.json()
	const newGroup = { id: Date.now().toString(), name }
	db.groups.push(newGroup)
	return NextResponse.json(newGroup)
}
