'use client'

import { supabase } from '@/lib/supabase'
import { useGetProfilesQuery } from '@/services/teacher/teacherApi'
import { formatName } from '@/utils/formatName'
import {
	CalendarOutlined,
	LoginOutlined,
	LogoutOutlined,
	SettingOutlined,
	UserOutlined,
} from '@ant-design/icons'
import {
	Avatar,
	Button,
	Dropdown,
	Layout,
	Menu,
	Space,
	theme,
	Typography,
} from 'antd'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { ThemeSwitcher } from './ThemeSwitcher'
import { User } from '@supabase/supabase-js'

const { Header, Content } = Layout
const { Text } = Typography

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
	const router = useRouter()
	const pathname = usePathname()
	const { token: antdToken } = theme.useToken()

	const [currentUser, setCurrentUser] = useState<User | null>(null)

	// Подключаем профили из базы
	const { data: profiles = [] } = useGetProfilesQuery()

	useEffect(() => {
		// Проверяем сессию при загрузке
		supabase.auth.getSession().then(({ data: { session } }) => {
			setCurrentUser(session?.user ?? null)
		})

		// Слушаем изменения авторизации
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setCurrentUser(session?.user ?? null)
		})

		return () => subscription.unsubscribe()
	}, [])

	const handleLogout = async () => {
		await supabase.auth.signOut()
		router.push('/login')
	}

	// Находим данные профиля текущего пользователя
	const myProfile = profiles.find(p => p.id === currentUser?.id)
	const isAdmin = currentUser?.app_metadata?.role === 'admin'
	const profileName = myProfile?.full_name
		? formatName(myProfile?.full_name)
		: null
	console.log(profileName)

	// Выпадающее меню аватара
	const userMenuItems = [
		{
			key: 'profile',
			icon: <UserOutlined />,
			label: <Link href='/profile'>Мой профиль</Link>,
		},
		{
			type: 'divider' as const,
		},
		{
			key: 'logout',
			icon: <LogoutOutlined />,
			label: 'Выйти',
			danger: true,
			onClick: handleLogout,
		},
	]

	// Основное навигационное меню
	const menuItems = [
		...(currentUser
			? [
					// Показываем управление только АДМИНУ
					...(isAdmin
						? [
								{
									key: '/management',
									icon: <SettingOutlined />,
									label: <Link href='/management'>Управление</Link>,
								},
							]
						: []),
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
					position: 'sticky',
					top: 0,
					width: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '0 24px',
					boxShadow: '0 1px 5px rgba(0,0,0,0.10)',
					zIndex: 10,
					backgroundColor: antdToken.colorBgLayout,
					color: antdToken.colorText,
					borderBottom: `1px solid ${antdToken.colorBorderSecondary}`,
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

					{currentUser ? (
						<Dropdown
							menu={{ items: userMenuItems }}
							placement='bottomRight'
							arrow
						>
							<Space
								style={{
									cursor: 'pointer',
									padding: '4px 8px',
									borderRadius: 8,
								}}
							>
								<div
									style={{
										textAlign: 'right',
										lineHeight: 1,
										display: 'flex',
										flexDirection: 'column',
									}}
								>
									<Text strong style={{ fontSize: '16px' }}>
										{profileName || 'Загрузка...'}
									</Text>
									<Text type='secondary' style={{ fontSize: '15px' }}>
										{isAdmin ? 'Администратор' : 'Преподаватель'}
									</Text>
								</div>
								<Avatar
									size='large'
									src={myProfile?.avatar_url}
									icon={<UserOutlined />}
									style={{ backgroundColor: antdToken.colorPrimary }}
								/>
							</Space>
						</Dropdown>
					) : (
						<Space>
							<Button
								type='primary'
								icon={<LoginOutlined />}
								onClick={() => router.push('/login')}
							>
								Войти
							</Button>
							<Button onClick={() => router.push('/register')}>
								Регистрация
							</Button>
						</Space>
					)}
				</Space>
			</Header>

			<Content
				style={{
					padding: '32px 34px',
					background: antdToken.colorBgLayout,
				}}
			>
				<div style={{ width: '100%', margin: '0 auto' }}>{children}</div>
			</Content>
		</Layout>
	)
}
