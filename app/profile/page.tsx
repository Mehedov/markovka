'use client'
import { supabase } from '@/lib/supabase'
import {
	useGetProfilesQuery,
	useUpdateProfileMutation,
} from '@/services/teacher/teacherApi'
import { EditOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons'
import {
	Avatar,
	Button,
	Card,
	Col,
	Form,
	Input,
	message,
	Row,
	Space,
	Typography,
} from 'antd'
import { useEffect, useState } from 'react'

const { Title, Text } = Typography

export default function ProfilePage() {
	const [currentUser, setCurrentUser] = useState<any>(null)
	const { data: profiles = [] } = useGetProfilesQuery()
	const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()
	const [form] = Form.useForm()

	useEffect(() => {
		supabase.auth.getUser().then(({ data }) => {
			setCurrentUser(data.user)
		})
	}, [])

	const myProfile = profiles.find(p => p.id === currentUser?.id)

	// Заполняем форму, когда данные загружены
	useEffect(() => {
		if (myProfile) {
			form.setFieldsValue({ full_name: myProfile.full_name })
		}
	}, [myProfile, form])

	const onFinish = async (values: { full_name: string }) => {
		try {
			await updateProfile({
				id: currentUser.id,
				full_name: values.full_name,
			}).unwrap()
			message.success('Данные успешно обновлены!')
		} catch (e) {
			message.error('Ошибка при обновлении профиля')
		}
	}

	return (
		<div style={{ maxWidth: 800, margin: '0 auto' }}>
			<Title level={2}>Настройки профиля</Title>

			<Row gutter={24}>
				<Col xs={24} md={8}>
					<Card textAlign='center'>
						<Space
							direction='vertical'
							align='center'
							style={{ width: '100%' }}
						>
							<Avatar
								size={120}
								src={myProfile?.avatar_url}
								icon={<UserOutlined />}
								style={{ backgroundColor: '#1890ff' }}
							/>
							<Title level={4} style={{ margin: 0 }}>
								{myProfile?.full_name}
							</Title>
							<Text type='secondary'>{currentUser?.email}</Text>
						</Space>
					</Card>
				</Col>

				<Col xs={24} md={16}>
					<Card
						title={
							<Space>
								<EditOutlined /> Личные данные
							</Space>
						}
					>
						<Form form={form} layout='vertical' onFinish={onFinish}>
							<Form.Item
								name='full_name'
								label='Полное имя (ФИО)'
								rules={[{ required: true, message: 'Пожалуйста, введите имя' }]}
							>
								<Input size='large' placeholder='Иван Иванов' />
							</Form.Item>

							<Form.Item>
								<Button
									type='primary'
									htmlType='submit'
									icon={<SaveOutlined />}
									loading={isUpdating}
									size='large'
								>
									Сохранить изменения
								</Button>
							</Form.Item>
						</Form>
					</Card>
				</Col>
			</Row>
		</div>
	)
}
