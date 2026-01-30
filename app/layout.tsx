// app/layout.tsx
import { MainLayout } from '@/components/MainLayout'
import { AntdProvider } from '@/providers/AntdProvider'
import { StoreProvider } from '@/providers/StoreProvider'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import ruRU from 'antd/locale/ru_RU'


export const metadata = {
	title: 'Attendance System',
	description: 'Система учета посещаемости',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='ru'>
			<body style={{ margin: 0 }}>
				<AntdRegistry>
					<StoreProvider>
						<AntdProvider>
							<ConfigProvider locale={ruRU}>
								
								<MainLayout>{children}</MainLayout>
							</ConfigProvider>
						</AntdProvider>
					</StoreProvider>
				</AntdRegistry>
			</body>
		</html>
	)
}
