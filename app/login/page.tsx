'use client'
import { supabase } from '@/lib/supabase'
import { GoogleOutlined } from '@ant-design/icons'
import { Button, Card, Divider, Form, Input, message } from 'antd'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	// Вход через Google
	const handleGoogleLogin = async () => {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				// Куда перенаправить пользователя после успешного входа
				redirectTo: `${window.location.origin}/auth/callback`,
			},
		})

		if (error) message.error('Ошибка Google-входа: ' + error.message)
	}

	const onFinish = async (values: any) => {
		setLoading(true)
		const { error } = await supabase.auth.signInWithPassword(values)
		setLoading(false)

		if (error) {
			message.error('Ошибка входа: ' + error.message)
		} else {
			message.success('Вы вошли!')
			router.push('/management')
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
			<Card title='Вход в систему' style={{ width: 400 }}>
				<Form onFinish={onFinish} layout='vertical'>
					<Form.Item
						name='email'
						label='Email'
						rules={[{ required: true, type: 'email' }]}
					>
						<Input placeholder='example@mail.com' />
					</Form.Item>
					<Form.Item
						name='password'
						label='Пароль'
						rules={[{ required: true }]}
					>
						<Input.Password />
					</Form.Item>
					<Button type='primary' htmlType='submit' block loading={loading}>
						Войти по паролю
					</Button>
				</Form>

				<Divider>или</Divider>

				<Button
					icon={<GoogleOutlined />}
					block
					onClick={handleGoogleLogin}
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					Войти через Google
				</Button>
			</Card>
		</div>
	)
}
