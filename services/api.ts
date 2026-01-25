import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const attendanceApi = createApi({
	reducerPath: 'attendanceApi',
	baseQuery: fetchBaseQuery({ baseUrl: '/api' }), // Относительный путь для Next.js API
	tagTypes: ['Groups', 'Students', 'Attendance'],
	endpoints: builder => ({
		getGroups: builder.query<any[], void>({
			query: () => '/groups',
			providesTags: ['Groups'],
		}),
		addGroup: builder.mutation<any, { name: string }>({
			query: body => ({ url: '/groups', method: 'POST', body }),
			invalidatesTags: ['Groups'],
		}),
		getStudents: builder.query<any[], void>({
			query: () => '/students',
			providesTags: ['Students'],
		}),
		addStudent: builder.mutation<any, { fullName: string; groupId: string }>({
			query: body => ({ url: '/students', method: 'POST', body }),
			invalidatesTags: ['Students'],
		}),
		getAttendance: builder.query<Record<string, string>, void>({
			query: () => '/attendance',
			providesTags: ['Attendance'],
		}),
		updateAttendance: builder.mutation<void, { key: string; status: string }>({
			query: body => ({ url: '/attendance', method: 'PATCH', body }),
			invalidatesTags: ['Attendance'],
		}),
		deleteStudent: builder.mutation<void, string>({
			query: id => ({
				url: `/students/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Students', 'Attendance'],
		}),

		deleteGroup: builder.mutation<void, string>({
			query: id => ({
				url: `/groups/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Groups', 'Students', 'Attendance'],
		}),
	}),
})

export const {
	useGetGroupsQuery,
	useAddGroupMutation,
	useGetStudentsQuery,
	useAddStudentMutation,
	useGetAttendanceQuery,
	useUpdateAttendanceMutation,
	useDeleteGroupMutation,
	useDeleteStudentMutation
} = attendanceApi
