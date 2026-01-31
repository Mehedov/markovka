'use client'
import { supabase } from '@/lib/supabase'
import { MailOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Form, Input, message } from 'antd'
import { useState } from 'react'

export default function RegisterPage() {
	const [isSent, setIsSent] = useState(false)
	const [loading, setLoading] = useState(false)

	const onFinish = async (values: any) => {
		setLoading(true)
		const { error } = await supabase.auth.signUp({
			email: values.email,
			password: values.password,
			options: {
				// Указываем, куда вернуться после подтверждения
				emailRedirectTo: `${window.location.origin}/auth/callback`,
			},
		})

		setLoading(false)

		if (error) {
			message.error('Ошибка: ' + error.message)
		} else {
			setIsSent(true) // Показываем экран "Проверьте почту"
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
			<Card title='Регистрация' style={{ width: 400 }}>
				{!isSent ? (
					<Form onFinish={onFinish} layout='vertical'>
						<Form.Item
							name='email'
							label='Email'
							rules={[{ required: true, type: 'email' }]}
						>
							<Input placeholder='test@example.com' />
						</Form.Item>
						<Form.Item
							name='password'
							label='Пароль'
							rules={[{ required: true, min: 6 }]}
						>
							<Input.Password />
						</Form.Item>
						<Button type='primary' htmlType='submit' block loading={loading}>
							Зарегистрироваться
						</Button>
					</Form>
				) : (
					<Alert
						message='Письмо отправлено!'
						description='Пожалуйста, проверьте почту и подтвердите аккаунт, прежде чем войти.'
						type='info'
						showIcon
						icon={<MailOutlined />}
					/>
				)}
			</Card>
		</div>
	)
}
