// app/api/students/route.ts
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
	return NextResponse.json(db.students)
}

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const newStudent = {
			id: Date.now().toString(),
			fullName: body.fullName,
			groupId: body.groupId,
		}

		db.students.push(newStudent)
		return NextResponse.json(newStudent)
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to add student' },
			{ status: 500 },
		)
	}
}
