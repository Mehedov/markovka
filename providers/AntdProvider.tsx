// providers/AntdProvider.tsx
'use client'
import { ConfigProvider, theme } from 'antd'

export const AntdProvider = ({ children }: { children: React.ReactNode }) => (
	<ConfigProvider
		theme={{
			algorithm: theme.darkAlgorithm, // По умолчанию темная для "вау" эффекта
			token: {
				colorPrimary: '#1890ff',
				colorSuccess: '#52c41a',
				colorError: '#ff4d4f',
				borderRadius: 8,
			},
			components: {
				Table: {
					headerBg: 'transparent',
				},
			},
		}}
	>
		{children}
	</ConfigProvider>
)
