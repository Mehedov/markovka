import { supabase } from '@/lib/supabase'
import { baseApi } from '../api'

export const attendanceApi = baseApi.injectEndpoints({
	endpoints: build => ({
		getAttendance: build.query<any[], void>({
			queryFn: async () => {
				const {
					data: { user },
				} = await supabase.auth.getUser()

				const { data, error } = await supabase
					.from('attendance')
					.select('id, student_id, subject_id, date, status, teacher_id')
					.eq('teacher_id', user?.id)

				return error ? { error } : { data: data || [] }
			},
			providesTags: ['Attendance'],
		}),

		updateAttendance: build.mutation({
			queryFn: async payload => {
				const { data, error } = await supabase
					.from('attendance')
					.upsert(payload, {
						onConflict: 'student_id,subject_id,date,teacher_id',
					})
					.select('*')
				return error ? { error } : { data: data[0] }
			},
			async onQueryStarted(
				{ student_id, date, status, teacher_id, subject_id },
				{ dispatch, queryFulfilled },
			) {
				const patchResult = dispatch(
					attendanceApi.util.updateQueryData(
						'getAttendance',
						undefined,
						draft => {
							// Ищем запись с учетом ВСЕХ ключей, включая subject_id
							const record = draft.find(
								r =>
									r.student_id === student_id &&
									r.date === date &&
									r.teacher_id === teacher_id &&
									r.subject_id === subject_id,
							)

							if (record) {
								record.status = status
							} else {
								draft.push({
									id: Date.now().toString(),
									student_id,
									subject_id,
									date,
									status,
									teacher_id,
								})
							}
						},
					),
				)
				try {
					await queryFulfilled
				} catch {
					patchResult.undo()
				}
			},
		}),
	}),
})

export const { useGetAttendanceQuery, useUpdateAttendanceMutation } =
	attendanceApi
