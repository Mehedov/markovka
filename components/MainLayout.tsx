'use client' // Это критически важно для AntD в App Router

import { CheckSquareOutlined, SettingOutlined } from '@ant-design/icons'
import { Layout, Menu, theme } from 'antd'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const { Header, Content, Sider } = Layout

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname()
	const {
		token: { colorBgContainer, borderRadiusLG },
	} = theme.useToken()

	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Sider breakpoint='lg' collapsedWidth='0'>
				<div
					style={{
						height: 32,
						margin: 16,
						background: 'rgba(255,255,255,.2)',
						borderRadius: 6,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						color: 'white',
					}}
				>
					LOGOTYPE
				</div>
				<Menu
					theme='dark'
					mode='inline'
					selectedKeys={[pathname]}
					items={[
						{
							key: '/',
							icon: <CheckSquareOutlined />,
							label: <Link href='/'>Посещаемость</Link>,
						},
						{
							key: '/management',
							icon: <SettingOutlined />,
							label: <Link href='/management'>Управление</Link>,
						},
					]}
				/>
			</Sider>
			<Layout>
				<Header style={{ padding: 0, background: colorBgContainer }} />
				<Content style={{ margin: '24px 16px 0' }}>
					<div
						style={{
							padding: 24,
							minHeight: 360,
							background: colorBgContainer,
							borderRadius: borderRadiusLG,
						}}
					>
						{children}
					</div>
				</Content>
			</Layout>
		</Layout>
	)
}
