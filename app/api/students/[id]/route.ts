import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } },
) {
	const { id } = await params

	// Фильтруем массив, удаляя студента с нужным ID
	db.students = db.students.filter(s => s.id !== id)

	// Также удаляем все записи посещаемости, связанные с этим студентом
	Object.keys(db.attendance).forEach(key => {
		if (key.startsWith(`${id}_`)) {
			delete db.attendance[key]
		}
	})

	return NextResponse.json({ success: true })
}
