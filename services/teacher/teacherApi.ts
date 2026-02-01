import { supabase } from '@/lib/supabase'
import { baseApi } from '../api'

const teacherApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		// 1. Получение одного профиля (для хедера)
		getProfile: builder.query<any, string>({
			queryFn: async id => {
				if (!id) return { data: null }
				const { data, error } = await supabase
					.from('profiles')
					.select('*')
					.eq('id', id)
					.single()
				return error ? { error } : { data }
			},
			providesTags: (result, error, id) => [{ type: 'Profiles', id }],
		}),

		// 2. Получение всех профилей (может понадобиться в списках)
		getProfiles: builder.query<any[], void>({
			queryFn: async () => {
				const { data, error } = await supabase.from('profiles').select('*')
				return error ? { error } : { data }
			},
			providesTags: ['Profiles'],
		}),

		// 3. ОБНОВЛЕНИЕ (то самое, что исправляет ошибку PGRST204)
		updateProfile: builder.mutation<any, { id: string; full_name: string }>({
			queryFn: async ({ id, full_name }) => {
				const { data, error } = await supabase
					.from('profiles')
					.upsert({ id, full_name })
					.select()
				return error ? { error } : { data: data[0] }
			},
			invalidatesTags: (result, error, { id }) => [
				{ type: 'Profiles', id },
				'Profiles',
			],
		}),

		// 4. СВЯЗИ (то, что требует AttendanceTableFilters)
		getTeacherRelations: builder.query<any[], void>({
			queryFn: async () => {
				const { data, error } = await supabase
					.from('teacher_subjects')
					.select('*')
				return error ? { error } : { data }
			},
			providesTags: ['TeacherRelations'],
		}),

		// Дополнительные методы управления связями
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

// ВАЖНО: Добавь все хуки в экспорт!
export const {
	useGetProfileQuery,
	useGetProfilesQuery,
	useUpdateProfileMutation,
	useGetTeacherRelationsQuery, // Теперь фильтры найдут этот экспорт
	useAssignSubjectToTeacherMutation,
	useRemoveTeacherRelationMutation,
} = teacherApi
