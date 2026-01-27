'use client'

import { supabase } from '@/lib/supabase'
import {
	CalendarOutlined,
	LoginOutlined,
	LogoutOutlined,
	SettingOutlined,
} from '@ant-design/icons'
import { Button, Layout, Menu, Space, theme } from 'antd'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { ThemeSwitcher } from './ThemeSwitcher'

const { Header, Content } = Layout

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
		// Добавляем ссылку на Управление только если пользователь авторизован
		...(isLoggedIn
			? [
					{
						key: '/management',
						icon: <SettingOutlined />,
						label: <Link href='/management'>Управление</Link>,
					},
					{
						key: '/',
						icon: <CalendarOutlined />,
						label: <Link href='/'>Посещаемость</Link>,
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
					backgroundColor: antdToken.colorBgLayout,
					color: antdToken.colorText,
				}}
			>
				<Space size='large'>
					<Menu
						mode='horizontal'
						selectedKeys={[pathname]}
						items={menuItems}
						style={{
							minWidth: 300,
							borderBottom: 'none',
							backgroundColor: antdToken.colorBgLayout,
							color: antdToken.colorText,
						}}
					/>
				</Space>

				<Space size='middle'>
					<ThemeSwitcher />
					{isLoggedIn ? (
						<>
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
						<div>
							<Button
								type='primary'
								icon={<LoginOutlined />}
								onClick={() => router.push('/login')}
							>
								Войти
							</Button>
							<Button
								type='primary'
								icon={<LoginOutlined />}
								onClick={() => router.push('/register')}
							>
								Зарегистрироваться
							</Button>
						</div>
					)}
				</Space>
			</Header>

			<Content
				style={{ padding: '32px 50px', background: antdToken.colorBgLayout }}
			>
				<div style={{ maxWidth: 1400, margin: '0 auto' }}>{children}</div>
			</Content>
		</Layout>
	)
}
