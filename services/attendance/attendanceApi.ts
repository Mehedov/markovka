import { supabase } from '@/lib/supabase'
import { baseApi } from '../api'
import { Attendance } from '@/types/attendance'

const attendanceApi = baseApi.injectEndpoints({
	endpoints: build => ({
		// ПОСЕЩАЕМОСТЬ
		getAttendance: build.query<Attendance[], void>({
			queryFn: async () => {
				const { data, error } = await supabase.from('attendance').select('*')
				console.log(data)

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
