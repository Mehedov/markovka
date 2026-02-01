import { supabase } from '@/lib/supabase'
import { baseApi } from '../api'

const teacherApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		// ПОЛУЧЕНИЕ ПРОФИЛЯ ТЕКУЩЕГО УЧИТЕЛЯ
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

		// ПОЛУЧЕНИЕ ВСЕХ ПРОФИЛЕЙ (если нужно для списка)
		getProfiles: builder.query<any[], void>({
			queryFn: async () => {
				const { data, error } = await supabase.from('profiles').select('*')
				if (error) return { error }
				return { data }
			},
			providesTags: ['Profiles'],
		}),

		// ОБНОВЛЕНИЕ ПРОФИЛЯ (с использованием upsert для надежности)
		updateProfile: builder.mutation<any, { id: string; full_name: string }>({
			queryFn: async ({ id, full_name }) => {
				const { data, error } = await supabase
					.from('profiles')
					.upsert({ id, full_name, updated_at: new Date().toISOString() })
					.select()

				if (error) return { error }
				return { data: data[0] }
			},
			invalidatesTags: (result, error, { id }) => [
				{ type: 'Profiles', id },
				'Profiles',
			],
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

		// ТОТ САМЫЙ МЕТОД, КОТОРЫЙ ТЕРЯЛСЯ
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
	}),
	overrideExisting: false,
})

// ГАРАНТИРОВАННЫЙ ЭКСПОРТ ВСЕХ ХУКОВ
export const {
	useGetProfileQuery,
	useGetProfilesQuery,
	useGetTeacherRelationsQuery,
	useAssignSubjectToTeacherMutation,
	useRemoveTeacherRelationMutation, // Теперь он здесь
	useUpdateProfileMutation,
} = teacherApi
