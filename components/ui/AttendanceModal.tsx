'use client'

import {
	useGetProfilesQuery,
	useUpdateProfileMutation,
} from '@/services/teacher/teacherApi'
import { User } from '@supabase/supabase-js'
import { Button, Form, Input, message, Modal } from 'antd'
import { useMemo, useState } from 'react'

export function AttendanceModal({ currentUser }: { currentUser: User | null }) {
	const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()
	const [hasJustFinishedOnboarding, setHasJustFinishedOnboarding] =
		useState(false)

	// Добавляем refetch, чтобы принудительно обновить список профилей при логине
	const { data: profiles = [], refetch: refetchProfiles } =
		useGetProfilesQuery()

	// ВЫЧИСЛЯЕМ, НУЖЕН ЛИ ONBOARDING
	const myProfile = useMemo(
		() => profiles.find(p => p.id === currentUser?.id),
		[profiles, currentUser],
	)

	const shouldShowOnboarding = useMemo(() => {
		// Флаг для закрытия модалки после успешного ввода имени

		// Не показываем, если: еще нет юзера, уже ввели имя в этой сессии, или это админ
		if (!currentUser || hasJustFinishedOnboarding) return false
		if (currentUser.app_metadata?.role === 'admin') return false

		// Показываем, если профили загружены, но имени нет
		if (profiles.length > 0) {
			return !myProfile || !myProfile.full_name
		}

		return false
	}, [currentUser, myProfile, profiles, hasJustFinishedOnboarding])

	const handleFinishOnboarding = async (values: { full_name: string }) => {
		try {
			if (currentUser && values) {
				await updateProfile({
					id: currentUser.id,
					full_name: values.full_name,
				}).unwrap()

				message.success('Приятно познакомиться, ' + values.full_name)
				setHasJustFinishedOnboarding(true) // Мгновенно скрываем модалку
			}
		} catch (e) {
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
