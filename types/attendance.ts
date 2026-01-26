export type AttendanceStatus = 'present' | 'absent' | 'none'

export interface Student {
	id: string
	fullName: string
	group_id: string
}

export interface Group {
	id: string
	name: string
}

export interface Attendance {
	id: string
	student_id: string
	subject_id: string
	date: string
  status: AttendanceStatus
}

export interface AttendanceState {
	groups: Group[]
	students: Student[]
	// Ключ: studentId_date (например: "1_2024-05-20")
	records: Record<string, AttendanceStatus>
}

export interface Subjects {
	id: string
	name: string
	group_id: string
	created_at: string
}
