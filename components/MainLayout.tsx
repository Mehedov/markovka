'use client'

import { supabase } from '@/lib/supabase'
import { useGetProfileQuery } from '@/services/teacher/teacherApi' // Используем точечный запрос
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
import { User } from '@supabase/supabase-js'
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

	// 1. Получаем сессию
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

	// 2. Делаем запрос профиля ТОЛЬКО для этого ID
	const { data: myProfile, isLoading: isProfileLoading } = useGetProfileQuery(
		userId ?? '',
		{
			skip: !userId, // Не делаем запрос, пока нет ID
		},
	)

	const handleLogout = async () => {
		await supabase.auth.signOut()
		router.push('/login')
	}

	const isAdmin = userMetadata?.role === 'admin'
	const profileName = myProfile?.full_name
		? formatName(myProfile.full_name)
		: null

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

	const menuItems = [
		...(userId
			? [
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
						<Space>
							<Button type='primary' onClick={() => router.push('/login')}>
								Войти
							</Button>
						</Space>
					)}
				</Space>
			</Header>

			<Content
				style={{ padding: '32px 34px', background: antdToken.colorBgLayout }}
			>
				<div style={{ width: '100%', margin: '0 auto' }}>{children}</div>
			</Content>
		</Layout>
	)
}
