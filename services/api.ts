import { supabase } from '@/lib/supabase'
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

export const attendanceApi = createApi({
	reducerPath: 'attendanceApi',
	baseQuery: fakeBaseQuery(),
	tagTypes: ['Groups', 'Students', 'Subjects', 'Attendance'],
	endpoints: builder => ({
		// ГРУППЫ
		getGroups: builder.query<any[], void>({
			queryFn: async () => {
				const { data, error } = await supabase
					.from('groups')
					.select('*')
					.order('name')
				if (error) return { error }
				return { data }
			},
			providesTags: ['Groups'],
		}),
		addGroup: builder.mutation({
			queryFn: async newGroup => {
				const { data, error } = await supabase
					.from('groups')
					.insert([newGroup])
					.select()
				if (error) return { error }
				return { data: data[0] }
			},
			invalidatesTags: ['Groups'],
		}),
		deleteGroup: builder.mutation({
			queryFn: async id => {
				const { error } = await supabase.from('groups').delete().eq('id', id)
				if (error) return { error }
				return { data: id }
			},
			invalidatesTags: ['Groups', 'Students', 'Subjects', 'Attendance'],
		}),

		// СТУДЕНТЫ
		getStudents: builder.query<any[], void>({
			queryFn: async () => {
				const { data, error } = await supabase
					.from('students')
					.select('*')
					.order('full_name')
				if (error) return { error }
				return { data }
			},
			providesTags: ['Students'],
		}),
		addStudent: builder.mutation({
			queryFn: async newStudent => {
				const { data, error } = await supabase
					.from('students')
					.insert([newStudent])
					.select()
				if (error) return { error }
				return { data: data[0] }
			},
			invalidatesTags: ['Students'],
		}),
		deleteStudent: builder.mutation({
			queryFn: async id => {
				const { error } = await supabase.from('students').delete().eq('id', id)
				if (error) return { error }
				return { data: id }
			},
			invalidatesTags: ['Students', 'Attendance'],
		}),

		// ДИСЦИПЛИНЫ (ПРЕДМЕТЫ)
		getSubjects: builder.query<any[], void>({
			queryFn: async () => {
				const { data, error } = await supabase
					.from('subjects')
					.select('*')
					.order('name')
				if (error) return { error }
				return { data }
			},
			providesTags: ['Subjects'],
		}),
		addSubject: builder.mutation({
			queryFn: async newSubject => {
				const { data, error } = await supabase
					.from('subjects')
					.insert([newSubject])
					.select()
				if (error) return { error }
				return { data: data[0] }
			},
			invalidatesTags: ['Subjects'],
		}),
		deleteSubject: builder.mutation({
			queryFn: async id => {
				const { error } = await supabase.from('subjects').delete().eq('id', id)
				if (error) return { error }
				return { data: id }
			},
			invalidatesTags: ['Subjects', 'Attendance'],
		}),

		// ПОСЕЩАЕМОСТЬ
		getAttendance: builder.query<any[], void>({
			queryFn: async () => {
				const { data, error } = await supabase.from('attendance').select('*')
				if (error) return { error }
				return { data }
			},
			providesTags: ['Attendance'],
		}),
		updateAttendance: builder.mutation({
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
})

// Генерируем хуки. Убедись, что имена совпадают с теми, что в page.tsx
export const {
	useGetGroupsQuery,
	useAddGroupMutation,
	useDeleteGroupMutation,
	useGetStudentsQuery,
	useAddStudentMutation,
	useDeleteStudentMutation,
	useGetSubjectsQuery,
	useAddSubjectMutation,
	useDeleteSubjectMutation,
	useGetAttendanceQuery, // Вот этот хук вызывал ошибку
	useUpdateAttendanceMutation,
} = attendanceApi
