import { supabase } from '@/lib/supabase'
import { baseApi } from '../api'

const teacherApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		// ПОЛУЧЕНИЕ ПРОФИЛЕЙ (УЧИТЕЛЕЙ)
		getProfiles: builder.query<any[], void>({
			queryFn: async () => {
				const { data, error } = await supabase.from('profiles').select('*')
				if (error) return { error }
				return { data }
			},
			providesTags: ['Profiles'],
		}),

		// СВЯЗИ УЧИТЕЛЬ-ПРЕДМЕТ
		getTeacherRelations: builder.query<any[], void>({
			queryFn: async () => {
				const { data, error } = await supabase
					.from('teacher_subjects')
					.select('*')
				if (error) return { error }
				return { data }
			},
			providesTags: ['TeacherRelations'],
		}),

		assignSubjectToTeacher: builder.mutation<
			any,
			{ teacher_id: string; subject_id: string }
		>({
			queryFn: async payload => {
				const { data, error } = await supabase
					.from('teacher_subjects')
					.insert([payload])
					.select()
				if (error) return { error }
				return { data: data[0] }
			},
			invalidatesTags: ['TeacherRelations'],
		}),

		removeTeacherRelation: builder.mutation<void, string>({
			queryFn: async id => {
				const { error } = await supabase
					.from('teacher_subjects')
					.delete()
					.eq('id', id)
				if (error) return { error }
				return { data: undefined }
			},
			invalidatesTags: ['TeacherRelations'],
		}),
		updateProfile: builder.mutation<any, { id: string; full_name: string }>({
			queryFn: async ({ id, full_name }) => {
				const { data, error } = await supabase
					.from('profiles')
					.update({ full_name })
					.eq('id', id)
					.select()

				if (error) return { error }
				return { data: data[0] }
			},
			invalidatesTags: ['Profiles'],
		}),
	}),
	overrideExisting: false,
})

// Генерируем хуки. Убедись, что имена совпадают с теми, что в page.tsx
export const {
	useGetProfilesQuery, // Новый
	useGetTeacherRelationsQuery, // Новый
	useAssignSubjectToTeacherMutation, // Тот самый
	useRemoveTeacherRelationMutation,
	useUpdateProfileMutation,
} = teacherApi
