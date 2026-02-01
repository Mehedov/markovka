'use client'

import { supabase } from '@/lib/supabase'
import { useGetProfileQuery } from '@/services/teacher/teacherApi'
import { formatName } from '@/utils/formatName'
import {
	AppstoreOutlined,
	BookOutlined,
	CalendarOutlined,
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
	Skeleton,
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

	const [userId, setUserId] = useState<string | null>(null)
	const [userMetadata, setUserMetadata] = useState<any>(null)
	const [collapsed, setCollapsed] = useState(false) // Добавили состояние для Sider

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUserId(session?.user?.id ?? null)
			setUserMetadata(session?.user?.app_metadata ?? null)
		})

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUserId(session?.user?.id ?? null)
			setUserMetadata(session?.user?.app_metadata ?? null)
		})

		return () => subscription.unsubscribe()
	}, [])

	const { data: myProfile, isLoading: isProfileLoading } = useGetProfileQuery(
		userId ?? '',
		{ skip: !userId },
	)

	const handleLogout = async () => {
		await supabase.auth.signOut()
		router.push('/login')
	}

	const isAdmin = userMetadata?.role === 'admin'
	const profileName = myProfile?.full_name
		? formatName(myProfile.full_name)
		: null

	// Меню в шапке (для всех)
	const menuItems = [
		...(userId
			? [
					{
						key: '/',
						icon: <CalendarOutlined />,
						label: <Link href='/'>Посещаемость</Link>,
					},
				]
			: []),
	]

	// Боковое меню (только для админа)
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

	const userMenuItems = [
		{
			key: 'profile',
			icon: <UserOutlined />,
			label: <Link href='/profile'>Мой профиль</Link>,
		},
		{ type: 'divider' as const },
		{
			key: 'logout',
			icon: <LogoutOutlined />,
			label: 'Выйти',
			danger: true,
			onClick: handleLogout,
		},
	]

	return (
		<Layout style={{ minHeight: '100vh' }}>
			{/* Боковая панель появляется только у админа на страницах управления */}
			{isAdmin && pathname.startsWith('/management') && (
				<Sider
					collapsible
					collapsed={collapsed}
					onCollapse={value => setCollapsed(value)}
					theme='light'
					style={{ borderRight: `1px solid ${antdToken.colorBorderSecondary}` }}
				>
					<div
						style={{
							height: 32,
							margin: 16,
							background: 'rgba(0, 0, 0, 0.05)',
							borderRadius: 6,
						}}
					/>
					<Menu
						theme='light'
						defaultSelectedKeys={[pathname]}
						mode='inline'
						items={adminSiderMenuItems}
					/>
				</Sider>
			)}

			<Layout>
				<Header
					style={{
						position: 'sticky',
						top: 0,
						zIndex: 10,
						width: '100%',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '0 24px',
						backgroundColor: antdToken.colorBgLayout,
						borderBottom: `1px solid ${antdToken.colorBorderSecondary}`,
					}}
				>
					<Space size='large'>
						<Menu
							mode='horizontal'
							selectedKeys={[pathname]}
							items={menuItems} // ИСПРАВЛЕНО: было topMenuItems
							style={{
								minWidth: 200,
								borderBottom: 'none',
								backgroundColor: 'transparent',
							}}
						/>
					</Space>

					<Space size='middle'>
						<ThemeSwitcher />
						{userId ? (
							<Dropdown
								menu={{ items: userMenuItems }}
								placement='bottomRight'
								arrow
							>
								<Space style={{ cursor: 'pointer', padding: '4px 8px' }}>
									<div
										style={{
											textAlign: 'right',
											lineHeight: 1,
											display: 'flex',
											flexDirection: 'column',
										}}
									>
										{isProfileLoading ? (
											<Skeleton.Input
												active
												size='small'
												style={{ width: 100, height: 16 }}
											/>
										) : (
											<>
												<Text strong style={{ fontSize: '16px' }}>
													{profileName || 'Без имени'}
												</Text>
												<Text type='secondary' style={{ fontSize: '13px' }}>
													{isAdmin ? 'Администратор' : 'Преподаватель'}
												</Text>
											</>
										)}
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
							<Button type='primary' onClick={() => router.push('/login')}>
								Войти
							</Button>
						)}
					</Space>
				</Header>

				<Content
					style={{ padding: '24px', background: antdToken.colorBgLayout }}
				>
					<div style={{ width: '100%', margin: '0 auto' }}>{children}</div>
				</Content>
			</Layout>
		</Layout>
	)
}
