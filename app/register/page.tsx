'use client'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Typography, message } from 'antd'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
	const router = useRouter()

	const onFinish = async (values: any) => {
		const res = await fetch('/api/auth/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(values),
		})

		if (res.ok) {
			message.success('Регистрация успешна! Теперь войдите.')
			router.push('/login')
		} else {
			const data = await res.json()
			message.error(data.error || 'Ошибка при регистрации')
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
			<Card style={{ width: 400, borderRadius: 16 }}>
				<Typography.Title level={3} style={{ textAlign: 'center' }}>
					Регистрация
				</Typography.Title>
				<Form onFinish={onFinish} layout='vertical'>
					<Form.Item
						name='username'
						label='Логин'
						rules={[{ required: true, message: 'Придумайте логин' }]}
					>
						<Input
							prefix={<UserOutlined />}
							placeholder='admin_new'
							size='large'
						/>
					</Form.Item>
					<Form.Item
						name='password'
						label='Пароль'
						rules={[{ required: true, min: 4, message: 'Минимум 4 символа' }]}
					>
						<Input.Password
							prefix={<LockOutlined />}
							placeholder='••••••'
							size='large'
						/>
					</Form.Item>
					<Button type='primary' htmlType='submit' block size='large'>
						Зарегистрироваться
					</Button>
					<div style={{ textAlign: 'center', marginTop: 16 }}>
						Уже есть аккаунт? <Link href='/login'>Войти</Link>
					</div>
				</Form>
			</Card>
		</div>
	)
}
