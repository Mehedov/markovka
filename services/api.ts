import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseApi = createApi({
	reducerPath: 'attendanceApi',
	baseQuery: fakeBaseQuery(),
	tagTypes: ['Groups', 'Students', 'Subjects', 'Attendance'],
	endpoints: () => ({}),
})


