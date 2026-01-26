import { supabase } from '@/lib/supabase'
import { baseApi } from '../api'
import { Subjects } from '@/types/attendance'

const subjectsApi = baseApi.injectEndpoints({
	endpoints: build => ({
		getSubjects: build.query<Subjects[], void>({
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
		addSubject: build.mutation({
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
		deleteSubject: build.mutation({
			queryFn: async id => {
				const { error } = await supabase.from('subjects').delete().eq('id', id)
				if (error) return { error }
				return { data: id }
			},
			invalidatesTags: ['Subjects', 'Attendance'],
		}),
	}),
	overrideExisting: false,
})

// Генерируем хуки. Убедись, что имена совпадают с теми, что в page.tsx
export const {
	useGetSubjectsQuery,
	useAddSubjectMutation,
	useDeleteSubjectMutation,
} = subjectsApi
