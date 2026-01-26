// providers/AntdProvider.tsx
'use client'
import { ConfigProvider, theme } from 'antd'

export const AntdProvider = ({ children }: { children: React.ReactNode }) => (
	<ConfigProvider
		theme={{
			algorithm: theme.darkAlgorithm, // По умолчанию темная тема
			token: {
				colorPrimary: '#1dbaee', // Сочный фиолетовый
				colorInfo: '#13c2c2',
				borderRadius: 12, // Более скругленные углы
				colorBgLayout: '#141414',
				colorBgContainer: '#141414', // Черный для карточек
			},
			components: {
				Table: {
					headerColor: '#8c8c8c',
					cellPaddingBlock: 12,
				},
				Card: {
					boxShadowTertiary: '0 4px 12px rgba(0,0,0,0.15)',
				},
				Menu: {
					darkItemSelectedBg: 'transparent', // Специальный токен для темной темы
					itemSelectedBg: 'transparent',
				},
			},
		}}
	>
		{children}
	</ConfigProvider>
)
