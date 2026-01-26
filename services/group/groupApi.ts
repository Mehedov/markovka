import { supabase } from '@/lib/supabase'
import { baseApi } from '../api'

const groupApi = baseApi.injectEndpoints({
	endpoints: build => ({
		getGroups: build.query<any[], void>({
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
		addGroup: build.mutation({
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
		deleteGroup: build.mutation({
			queryFn: async id => {
				const { error } = await supabase.from('groups').delete().eq('id', id)
				if (error) return { error }
				return { data: id }
			},
			invalidatesTags: ['Groups', 'Students', 'Subjects', 'Attendance'],
		}),
	}),
	overrideExisting: false,
})

export const {
	useGetGroupsQuery,
	useAddGroupMutation,
	useDeleteGroupMutation,
} = groupApi
