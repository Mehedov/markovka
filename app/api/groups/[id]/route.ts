import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function DELETE(
	req: Request,
	{ params }: { params: { id: string } },
) {
	const { id } = params

	// 1. Удаляем группу
	db.groups = db.groups.filter(g => g.id !== id)

	// 2. Находим всех студентов этой группы
	const studentsInGroup = db.students.filter(s => s.groupId === id)
	const studentIds = studentsInGroup.map(s => s.id)

	// 3. Удаляем студентов этой группы
	db.students = db.students.filter(s => s.groupId !== id)

	// 4. Чистим посещаемость этих студентов
	Object.keys(db.attendance).forEach(key => {
		const studentId = key.split('_')[0]
		if (studentIds.includes(studentId)) {
			delete db.attendance[key]
		}
	})

	return NextResponse.json({ success: true })
}
