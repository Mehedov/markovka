'use client'

import { User } from '@supabase/supabase-js'
import { Space, Spin } from 'antd'
import { useEffect, useState } from 'react'

// Библиотеки и API
import { supabase } from '@/lib/supabase'
import { useGetProfileQuery } from '@/services/teacher/teacherApi'

// Твои компоненты
import { AttendanceTable } from '@/components/elements/AttendanceTable'
import { AttendanceTableFilters } from '@/components/elements/AttendanceTableFilters'
import { AttendanceModal } from '@/components/ui/AttendanceModal'

export function AttendanceContainer() {
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
	const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
		null,
	)
	const [currentUser, setCurrentUser] = useState<User | null>(null)

	// Получаем сессию
	useEffect(() => {
		supabase.auth
			.getSession()
			.then(({ data: { session } }) => setCurrentUser(session?.user ?? null))
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_e, s) =>
			setCurrentUser(s?.user ?? null),
		)
		return () => subscription.unsubscribe()
	}, [])

	// Тянем профиль ТОЛЬКО текущего юзера
	const { data: profile, isLoading } = useGetProfileQuery(
		currentUser?.id ?? '',
		{
			skip: !currentUser?.id,
		},
	)

	// Если имя дефолтное — значит нужен онбординг
	const needsName =
		currentUser &&
		!isLoading &&
		(!profile?.full_name || profile.full_name === 'Новый преподаватель')

	if (isLoading) {
		return (
			<div
				style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}
			>
				<Spin size='large' />
			</div>
		)
	}

	return (
		<Space direction='vertical' size='large' style={{ width: '100%' }}>
			<AttendanceTableFilters
				setSelectedGroupId={setSelectedGroupId}
				setSelectedSubjectId={setSelectedSubjectId}
				selectedGroupId={selectedGroupId}
				selectedSubjectId={selectedSubjectId}
				currentUser={currentUser}
				IsLetsOnboarding={profile} // Теперь это один объект
			/>
			<AttendanceTable
				selectedGroupId={selectedGroupId}
				selectedSubjectId={selectedSubjectId}
				currentUser={currentUser}
			/>
			{needsName && <AttendanceModal currentUser={currentUser} />}
		</Space>
	)
}
