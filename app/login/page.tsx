'use client'
import { supabase } from '@/lib/supabase'
import { baseApi } from '@/services/api'
import { Button, Card, Form, Input, message } from 'antd'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'

export default function LoginPage() {
	const router = useRouter()
	const dispatch = useDispatch()

	const onFinish = async (values: { email: string; password: string }) => {
		const { error } = await supabase.auth.signInWithPassword({
			email: values.email, // Используем email вместо username
			password: values.password,
		})

		if (error) {
			message.error('Ошибка входа: ' + error.message)
		} else {
			message.success('Вы вошли!')
			router.push('/management')
			dispatch(baseApi.util.resetApiState()) // Это полностью очистит кеш всех запросов
			router.refresh()
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
			<Card title='Вход' style={{ width: 400 }}>
				<Form onFinish={onFinish} layout='vertical'>
					<Form.Item
						name='email'
						label='Email'
						rules={[{ required: true, type: 'email' }]}
					>
						<Input placeholder='admin@example.com' />
					</Form.Item>
					<Form.Item
						name='password'
						label='Пароль'
						rules={[{ required: true }]}
					>
						<Input.Password />
					</Form.Item>
					<Button type='primary' htmlType='submit' block>
						Войти
					</Button>
				</Form>
			</Card>
		</div>
	)
}
