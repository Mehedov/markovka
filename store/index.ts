import { attendanceApi } from '@/services/api'
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
	reducer: {
		// Добавляем редьюсер API
		[attendanceApi.reducerPath]: attendanceApi.reducer,
	},
	// Middleware нужен для кэширования, инвалидации и других фишек RTK Query
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware().concat(attendanceApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
