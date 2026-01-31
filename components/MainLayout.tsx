'use client'

import { supabase } from '@/lib/supabase'
import { useGetProfilesQuery } from '@/services/teacher/teacherApi'
import { formatName } from '@/utils/formatName'
import {
	AppstoreOutlined,
	BookOutlined,
	CalendarOutlined,
	LoginOutlined,
	LogoutOutlined,
	SettingOutlined,
	TeamOutlined,
	UserAddOutlined,
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

const { Header, Content, Sider } = Layout
const { Text } = Typography

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
	const router = useRouter()
	const pathname = usePathname()
	const { token: antdToken } = theme.useToken()

	const [currentUser, setCurrentUser] = useState<{
		id: string
		email: string
		app_metadata?: { role: string }
	} | null>(null)
	const [collapsed, setCollapsed] = useState(false)

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
	const topMenuItems = [
		...(currentUser
			? [
					{
						key: '/',
						icon: <CalendarOutlined />,
						label: <Link href='/'>Посещаемость</Link>,
					},
				]
			: []),
	]

	// Боковое меню для администратора
	const adminSiderMenuItems = isAdmin
		? [
				{
					key: '/management',
					icon: <AppstoreOutlined />,
					label: <Link href='/management'>Главная</Link>,
				},
				{
					key: '/management/groups',
					icon: <TeamOutlined />,
					label: <Link href='/management/groups'>Группы</Link>,
				},
				{
					key: '/management/students',
					icon: <UserAddOutlined />,
					label: <Link href='/management/students'>Студенты</Link>,
				},
				{
					key: '/management/subjects',
					icon: <BookOutlined />,
					label: <Link href='/management/subjects'>Предметы</Link>,
				},
				{
					key: '/management/teachers',
					icon: <SettingOutlined />,
					label: <Link href='/management/teachers'>Преподаватели</Link>,
				},
			]
		: []

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
						items={topMenuItems}
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

			<Layout>
				{isAdmin && (
					<Sider
						collapsible
						collapsed={collapsed}
						onCollapse={value => setCollapsed(value)}
						width={250}
						style={{
							background: antdToken.colorBgContainer,
							borderRight: `1px solid ${antdToken.colorBorderSecondary}`,
						}}
					>
						<div
							style={{
								height: 40,
								margin: '16px',
								paddingLeft: 8,
								fontWeight: 'bold',
								fontSize: '16px',
								display: 'flex',
								alignItems: 'center',
							}}
						>
							{collapsed ? '' : 'Управление'}
						</div>
						<Menu
							mode='inline'
							selectedKeys={[pathname]}
							items={adminSiderMenuItems}
							style={{
								borderRight: 0,
								background: 'transparent',
							}}
						/>
					</Sider>
				)}
				<Content
					style={{
						padding: '24px',
						background: antdToken.colorBgLayout,
						minHeight: 'calc(100vh - 64px)',
					}}
				>
					<div style={{ width: '100%', margin: '0 auto' }}>{children}</div>
				</Content>
			</Layout>
		</Layout>
	)
}
