'use client'

import { Space } from 'antd'
import { useEffect, useMemo, useState } from 'react'

import { AttendanceTable } from '@/components/elements/AttendanceTable'
import { supabase } from '@/lib/supabase'
import { useGetProfilesQuery } from '@/services/teacher/teacherApi'
import { User } from '@supabase/supabase-js'
import { AttendanceTableFilters } from '../elements/AttendanceTableFilters'
import { AttendanceModal } from '../ui/AttendanceModal'

export function AttendanceTableContainers() {
	// Состояния фильтров
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
	const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
		null,
	)
	const [currentUser, setCurrentUser] = useState<User | null>(null)

	// Добавляем refetch, чтобы принудительно обновить список профилей при логине
	const { data: profiles = [], refetch: refetchProfiles } =
		useGetProfilesQuery()

	// СЛУШАЕМ АВТОРИЗАЦИЮ В РЕАЛЬНОМ ВРЕМЕНИ
	useEffect(() => {
		// 1. Проверяем текущего юзера сразу
		supabase.auth.getUser().then(({ data }) => {
			if (data.user) {
				setCurrentUser(data.user)
				refetchProfiles() // Обновляем профили, если юзер найден
			}
		})

		// 2. Подписываемся на изменения (важно для первой регистрации/логина)
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (session?.user) {
				setCurrentUser(session.user)
				refetchProfiles() // Как только появились куки/сессия — тянем профиль
			} else {
				setCurrentUser(null)
			}
		})

		return () => subscription.unsubscribe()
	}, [refetchProfiles])

	// ВЫЧИСЛЯЕМ, НУЖЕН ЛИ ONBOARDING
	const IsLetsOnboarding: User = useMemo(
		() => profiles.find(p => p.id === currentUser?.id),
		[profiles, currentUser],
	)

	return (
		<Space orientation='vertical' size='large' style={{ width: '100%' }}>
			<AttendanceTableFilters
				setSelectedGroupId={setSelectedGroupId}
				setSelectedSubjectId={setSelectedSubjectId}
				selectedGroupId={selectedGroupId}
				selectedSubjectId={selectedSubjectId}
				currentUser={currentUser}
				IsLetsOnboarding={IsLetsOnboarding}
			/>
			<AttendanceTable
				selectedGroupId={selectedGroupId}
				selectedSubjectId={selectedSubjectId}
			/>

			<AttendanceModal currentUser={currentUser} />
		</Space>
	)
}
