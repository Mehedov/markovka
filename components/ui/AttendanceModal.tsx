'use client'

import {
	useGetProfileQuery, // Используем точечный запрос
	useUpdateProfileMutation,
} from '@/services/teacher/teacherApi'
import { User } from '@supabase/supabase-js'
import { Button, Form, Input, message, Modal } from 'antd'
import { useMemo, useState } from 'react'

export function AttendanceModal({ currentUser }: { currentUser: User | null }) {
	const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()
	const [hasJustFinishedOnboarding, setHasJustFinishedOnboarding] =
		useState(false)

	// Получаем профиль только текущего пользователя
	const { data: myProfile, isLoading: isProfileLoading } = useGetProfileQuery(
		currentUser?.id ?? '',
		{ skip: !currentUser?.id },
	)

	const shouldShowOnboarding = useMemo(() => {
		if (!currentUser || hasJustFinishedOnboarding) return false
		if (currentUser.app_metadata?.role === 'admin') return false
		if (isProfileLoading) return false

		// Список дефолтных имен, которые считаются "пустыми"
		const defaultNames = ['Новый преподаватель', 'Новый пользователь', '']

		// Показываем, если записи нет ВООБЩЕ или имя совпадает с дефолтным
		const isNameEmpty =
			!myProfile?.full_name || defaultNames.includes(myProfile.full_name.trim())

		return isNameEmpty
	}, [currentUser, myProfile, isProfileLoading, hasJustFinishedOnboarding])

	const handleFinishOnboarding = async (values: { full_name: string }) => {
		try {
			if (currentUser && values.full_name) {
				await updateProfile({
					id: currentUser.id,
					full_name: values.full_name,
				}).unwrap()

				message.success('Приятно познакомиться, ' + values.full_name)
				setHasJustFinishedOnboarding(true)
			}
		} catch (e) {
			// Если здесь ошибка - проверь RLS политики в Supabase (UPDATE)
			message.error('Не удалось сохранить имя')
		}
	}

	return (
		<Modal
			title='Добро пожаловать в систему!'
			open={shouldShowOnboarding}
			footer={null}
			closable={false}
			maskClosable={false}
			destroyOnClose
		>
			<p>
				Пожалуйста, представьтесь, чтобы продолжить работу. Это имя будет
				отображаться в списках и отчетах.
			</p>
			<Form onFinish={handleFinishOnboarding} layout='vertical'>
				<Form.Item
					name='full_name'
					label='Ваше полное имя (ФИО)'
					rules={[{ required: true, message: 'Это поле обязательно' }]}
				>
					<Input placeholder='Напр: Иванов Иван Иванович' size='large' />
				</Form.Item>
				<Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
					<Button
						type='primary'
						htmlType='submit'
						size='large'
						loading={isUpdating}
						block
					>
						Сохранить и войти
					</Button>
				</Form.Item>
			</Form>
		</Modal>
	)
}
