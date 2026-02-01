'use client'
import { supabase } from '@/lib/supabase'
import { GoogleOutlined } from '@ant-design/icons'
import { Button, Card, Divider, Form, Input, message, Tabs } from 'antd'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	// ВХОД ЧЕРЕЗ GOOGLE
	const handleGoogleLogin = async () => {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: { redirectTo: `${window.location.origin}/auth/callback` },
		})
		if (error) message.error('Ошибка Google: ' + error.message)
	}

	// ОБЫЧНЫЙ ВХОД
	const onLogin = async (values: any) => {
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

	// РЕГИСТРАЦИЯ (теперь без ожидания подтверждения)
	const onRegister = async (values: any) => {
		setLoading(true)
		const { data, error } = await supabase.auth.signUp({
			email: values.email,
			password: values.password,
			options: {
				data: { full_name: values.full_name },
			},
		})
		setLoading(false)

		if (error) {
			message.error('Ошибка регистрации: ' + error.message)
		} else {
			message.success('Аккаунт создан!')
			// Если подтверждение выключено в Supabase, сессия создается сразу
			if (data.session) {
				router.push('/management')
			} else {
				// Если сессия не создалась автоматически, просим войти
				message.info('Теперь войдите, используя свои данные')
			}
		}
	}

	// Формы входа и регистрации (те же, что были раньше)
	const loginForm = (
		<Form onFinish={onLogin} layout='vertical'>
			<Form.Item
				name='email'
				label='Email'
				rules={[{ required: true, type: 'email' }]}
			>
				<Input placeholder='example@mail.com' />
			</Form.Item>
			<Form.Item name='password' label='Пароль' rules={[{ required: true }]}>
				<Input.Password />
			</Form.Item>
			<Button type='primary' htmlType='submit' block loading={loading}>
				Войти
			</Button>
		</Form>
	)

	const registerForm = (
		<Form onFinish={onRegister} layout='vertical'>
			<Form.Item name='full_name' label='ФИО' rules={[{ required: true }]}>
				<Input placeholder='Иван Иванов' />
			</Form.Item>
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
				rules={[{ required: true, min: 6 }]}
			>
				<Input.Password />
			</Form.Item>
			<Button type='primary' htmlType='submit' block loading={loading}>
				Создать аккаунт
			</Button>
		</Form>
	)

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				height: '90vh',
			}}
		>
			<Card style={{ width: 400 }}>
				<Tabs
					defaultActiveKey='1'
					items={[
						{ key: '1', label: 'Вход', children: loginForm },
						{ key: '2', label: 'Регистрация', children: registerForm },
					]}
				/>
				<Divider>или</Divider>
				<Button icon={<GoogleOutlined />} block onClick={handleGoogleLogin}>
					Войти через Google
				</Button>
			</Card>
		</div>
	)
}
