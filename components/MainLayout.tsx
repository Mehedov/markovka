'use client'

import { supabase } from '@/lib/supabase'
import {
	CalendarOutlined,
	CrownOutlined,
	LoginOutlined,
	LogoutOutlined,
	SettingOutlined,
} from '@ant-design/icons'
import { Button, Layout, Menu, Space, Typography, theme } from 'antd'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const { Header, Content, Footer } = Layout

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
	const router = useRouter()
	const pathname = usePathname()
	const { token: antdToken } = theme.useToken()

	const [isLoggedIn, setIsLoggedIn] = useState(false)

	useEffect(() => {
		// 1. Проверяем текущую сессию
		supabase.auth.getSession().then(({ data: { session } }) => {
			setIsLoggedIn(!!session)
		})

		// 2. Подписываемся на изменения (логин/логаут)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setIsLoggedIn(!!session)
		})

		return () => subscription.unsubscribe()
	}, [])

	const handleLogout = async () => {
		await supabase.auth.signOut()
		router.push('/')
	}

	// Формируем пункты меню динамически
	const menuItems = [
		{
			key: '/',
			icon: <CalendarOutlined />,
			label: <Link href='/'>Посещаемость</Link>,
		},
		// Добавляем ссылку на Управление только если пользователь авторизован
		...(isLoggedIn
			? [
					{
						key: '/management',
						icon: <SettingOutlined />,
						label: <Link href='/management'>Управление</Link>,
					},
				]
			: []),
	]

	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Header
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '0 24px',
					boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
					zIndex: 10,
				}}
			>
				<Space size='large'>
					<div
						style={{
							color: antdToken.colorPrimary,
							fontWeight: 'bold',
							fontSize: '20px',
							letterSpacing: '1px',
						}}
					>
						ATTENDANCE<span style={{ color: '#fff' }}>PRO</span>
					</div>

					<Menu
						theme='dark'
						mode='horizontal'
						selectedKeys={[pathname]}
						items={menuItems}
						style={{ minWidth: 300, borderBottom: 'none' }}
					/>
				</Space>

				<Space size='middle'>
					{isLoggedIn ? (
						<>
							<Space style={{ marginRight: 16 }}>
								<CrownOutlined style={{ color: '#ffec3d' }} />
								<Typography.Text style={{ color: 'white' }}>
									Администратор
								</Typography.Text>
							</Space>
							<Button
								type='primary'
								danger
								ghost
								icon={<LogoutOutlined />}
								onClick={handleLogout}
							>
								Выйти
							</Button>
						</>
					) : (
						<Button
							type='primary'
							icon={<LoginOutlined />}
							onClick={() => router.push('/login')}
						>
							Войти как админ
						</Button>
					)}
				</Space>
			</Header>

			<Content style={{ padding: '32px 50px', background: '#f5f5f5' }}>
				<div style={{ maxWidth: 1400, margin: '0 auto' }}>{children}</div>
			</Content>

			<Footer style={{ textAlign: 'center', color: '#8c8c8c' }}>
				Attendance Management System ©{new Date().getFullYear()}
			</Footer>
		</Layout>
	)
}
