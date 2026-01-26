import { baseApi } from '@/services/api'
import { configureStore } from '@reduxjs/toolkit'
import themeSlice  from "./slices/themeSlice"

export const store = configureStore({
	reducer: {theme: themeSlice,
		// Добавляем редьюсер API
		[baseApi.reducerPath]: baseApi.reducer,
	},
	// Middleware нужен для кэширования, инвалидации и других фишек RTK Query
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
