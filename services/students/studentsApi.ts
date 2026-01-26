import { supabase } from '@/lib/supabase'
import { baseApi } from '../api'


const studentApi = baseApi.injectEndpoints({
	endpoints: build => ({
		getStudents: build.query<any[], void>({
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
		addStudent: build.mutation({
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
		deleteStudent: build.mutation({
			queryFn: async id => {
				const { error } = await supabase.from('students').delete().eq('id', id)
				if (error) return { error }
				return { data: id }
			},
			invalidatesTags: ['Students', 'Attendance'],
		}),
	}),
	overrideExisting: false,
})

// Генерируем хуки. Убедись, что имена совпадают с теми, что в page.tsx
export const {
	useGetStudentsQuery,
	useAddStudentMutation,
	useDeleteStudentMutation,
} = studentApi
