export type AttendanceStatus = 'present' | 'absent' | 'none';

export interface Student {
  id: string;
  fullName: string;
  groupId: string;
}

export interface Group {
  id: string;
  name: string;
}

export interface AttendanceState {
  groups: Group[];
  students: Student[];
  // Ключ: studentId_date (например: "1_2024-05-20")
  records: Record<string, AttendanceStatus>; 
}