import { supabase } from '@/lib/supabase'
import { baseApi } from '../api'

const attendanceApi = baseApi.injectEndpoints({
	endpoints: build => ({
		// ПОСЕЩАЕМОСТЬ
		getAttendance: build.query<any[], void>({
			queryFn: async () => {
				const { data, error } = await supabase.from('attendance').select('*')
				if (error) return { error }
				return { data }
			},
			providesTags: ['Attendance'],
		}),
		updateAttendance: build.mutation({
			queryFn: async ({ student_id, subject_id, date, status }) => {
				const { data, error } = await supabase
					.from('attendance')
					.upsert(
						{ student_id, subject_id, date, status },
						{ onConflict: 'student_id,subject_id,date' },
					)
					.select()
				if (error) return { error }
				return { data: data[0] }
			},
			invalidatesTags: ['Attendance'],
		}),
	}),
	overrideExisting: false,
})

export const { useGetAttendanceQuery, useUpdateAttendanceMutation } =
	attendanceApi
