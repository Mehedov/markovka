import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AttendanceState, Group, Student, AttendanceStatus } from '@/types/attendance';

const initialState: AttendanceState = {
  groups: [],
  students: [],
  records: {},
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    addGroup: (state, action: PayloadAction<Group>) => {
      state.groups.push(action.payload);
    },
    addStudent: (state, action: PayloadAction<Student>) => {
      state.students.push(action.payload);
    },
    toggleAttendance: (state, action: PayloadAction<{ key: string }>) => {
      const current = state.records[action.payload.key] || 'none';
      // Циклическое переключение: none -> present (галочка) -> absent (крестик) -> none
      const nextStatus: Record<AttendanceStatus, AttendanceStatus> = {
        none: 'present',
        present: 'absent',
        absent: 'none',
      };
      state.records[action.payload.key] = nextStatus[current];
    },
  },
});

export const { addGroup, addStudent, toggleAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;