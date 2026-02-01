import { supabase } from '@/lib/supabase'
import { baseApi } from '../api'

const teacherApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		getProfile: builder.query<any, string>({
			queryFn: async id => {
				if (!id) return { data: null }
				const { data, error } = await supabase
					.from('profiles')
					.select('*')
					.eq('id', id)
					.single()

				if (error) return { error }
				return { data }
			},
			providesTags: (result, error, id) => [{ type: 'Profiles', id }],
		}),

		getProfiles: builder.query<any[], void>({
			queryFn: async () => {
				const { data, error } = await supabase.from('profiles').select('*')
				return error ? { error } : { data }
			},
			providesTags: ['Profiles'],
		}),

		updateProfile: builder.mutation<any, { id: string; full_name: string }>({
			queryFn: async ({ id, full_name }) => {
				// Мы НЕ отправляем updated_at, пока не убедимся, что колонка в БД есть
				const { data, error } = await supabase
					.from('profiles')
					.upsert({ id, full_name })
					.select()

				if (error) return { error }
				return { data: data[0] }
			},
			invalidatesTags: (result, error, { id }) => [
				{ type: 'Profiles', id },
				'Profiles',
			],
		}),

		getTeacherRelations: builder.query<any[], void>({
			queryFn: async () => {
				const { data, error } = await supabase
					.from('teacher_subjects')
					.select('*')
				return error ? { error } : { data }
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
				return error ? { error } : { data: data[0] }
			},
			invalidatesTags: ['TeacherRelations'],
		}),

		removeTeacherRelation: builder.mutation<void, string>({
			queryFn: async id => {
				const { error } = await supabase
					.from('teacher_subjects')
					.delete()
					.eq('id', id)
				return error ? { error } : { data: undefined }
			},
			invalidatesTags: ['TeacherRelations'],
		}),
	}),
	overrideExisting: false,
})

export const {
	useGetProfileQuery,
	useGetProfilesQuery,
	useGetTeacherRelationsQuery,
	useAssignSubjectToTeacherMutation,
	useRemoveTeacherRelationMutation,
	useUpdateProfileMutation,
} = teacherApi
