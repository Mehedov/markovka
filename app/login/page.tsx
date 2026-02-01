'use client'
import { supabase } from '@/lib/supabase'
import { Button, Card, Form, Input, message, Tabs } from 'antd'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
	const router = useRouter()
	const [loading, setLoading] = useState(false)

	const onLogin = async (values: any) => {
		setLoading(true)
		const { error } = await supabase.auth.signInWithPassword(values)
		setLoading(false)
		if (error) message.error(error.message)
		else router.push('/management')
	}

	const onRegister = async (values: any) => {
		setLoading(true)
		const { data, error } = await supabase.auth.signUp({
			email: values.email,
			password: values.password,
			options: { data: { full_name: values.full_name } },
		})
		setLoading(false)
		if (error) message.error(error.message)
		else {
			message.success('Регистрация успешна!')
			if (data.session) router.push('/management')
		}
	}

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
					items={[
						{
							key: '1',
							label: 'Вход',
							children: (
								<Form onFinish={onLogin} layout='vertical'>
									<Form.Item
										name='email'
										label='Email'
										rules={[{ required: true, type: 'email' }]}
									>
										<Input />
									</Form.Item>
									<Form.Item
										name='password'
										label='Пароль'
										rules={[{ required: true }]}
									>
										<Input.Password />
									</Form.Item>
									<Button
										type='primary'
										htmlType='submit'
										block
										loading={loading}
									>
										Войти
									</Button>
								</Form>
							),
						},
						{
							key: '2',
							label: 'Регистрация',
							children: (
								<Form onFinish={onRegister} layout='vertical'>
									<Form.Item
										name='full_name'
										label='ФИО'
										rules={[{ required: true }]}
									>
										<Input />
									</Form.Item>
									<Form.Item
										name='email'
										label='Email'
										rules={[{ required: true, type: 'email' }]}
									>
										<Input />
									</Form.Item>
									<Form.Item
										name='password'
										label='Пароль'
										rules={[{ required: true, min: 6 }]}
									>
										<Input.Password />
									</Form.Item>
									<Button
										type='primary'
										htmlType='submit'
										block
										loading={loading}
									>
										Создать аккаунт
									</Button>
								</Form>
							),
						},
					]}
				/>
			</Card>
		</div>
	)
}
