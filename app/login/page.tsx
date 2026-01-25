'use client'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Typography, message } from 'antd'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
	const router = useRouter()

	const onFinish = async (values: any) => {
		const res = await fetch('/api/auth/login', {
			method: 'POST',
			body: JSON.stringify(values),
		})

		if (res.ok) {
			message.success('Добро пожаловать, админ!')
			router.push('/management')
			router.refresh() // Обновляем состояние middleware
		} else {
			message.error('Доступ запрещен')
		}
	}

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '80vh',
			}}
		>
			<Card
				style={{
					width: 350,
					borderRadius: 16,
					boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
				}}
			>
				<Typography.Title level={3} style={{ textAlign: 'center' }}>
					Admin Access
				</Typography.Title>
				<Form onFinish={onFinish} layout='vertical'>
					<Form.Item
						name='username'
						rules={[{ required: true, message: 'Введите логин' }]}
					>
						<Input
							prefix={<UserOutlined />}
							placeholder='Логин (admin)'
							size='large'
						/>
					</Form.Item>
					<Form.Item
						name='password'
						rules={[{ required: true, message: 'Введите пароль' }]}
					>
						<Input.Password
							prefix={<LockOutlined />}
							placeholder='Пароль (admin)'
							size='large'
						/>
					</Form.Item>
					<Button
						type='primary'
						htmlType='submit'
						block
						size='large'
						style={{ borderRadius: 8 }}
					>
						Войти
					</Button>
				</Form>
			</Card>
		</div>
	)
}
