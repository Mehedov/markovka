'use client'

import { useGetGroupsQuery } from '@/services/group/groupApi'
import { useGetSubjectsQuery } from '@/services/subjects/subjectsApi'
import { useGetTeacherRelationsQuery } from '@/services/teacher/teacherApi'
import { User } from '@supabase/supabase-js'
import { Card, Col, ConfigProvider, DatePicker, Row, Select } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

export function AttendanceTableFilters({
	currentUser,
	setSelectedGroupId,
	setSelectedSubjectId,
	selectedGroupId,
	selectedSubjectId,
}: {
	currentUser: User | null
	IsLetsOnboarding: User | null
	setSelectedGroupId: (value: string | null) => void
	setSelectedSubjectId: (value: string | null) => void
	selectedGroupId: string | null
	selectedSubjectId: string | null
}) {
	const [selectedMonth, setSelectedMonth] = useState(dayjs())

	// Данные из RTK Query
	const { data: groups = [] } = useGetGroupsQuery()
	const { data: allSubjects = [] } = useGetSubjectsQuery()
	const { data: relations = [] } = useGetTeacherRelationsQuery()

	const teacherSubjects = useMemo(() => {
		if (!currentUser) return []
		if (currentUser.app_metadata?.role === 'admin') return allSubjects
		const mySubjectIds = relations
			.filter(r => r.teacher_id === currentUser.id)
			.map(r => r.subject_id)
		return allSubjects.filter(s => mySubjectIds.includes(s.id))
	}, [allSubjects, relations, currentUser])

	const teacherGroups = useMemo(() => {
		const groupIds = teacherSubjects.map(s => s.group_id)
		return groups.filter(g => groupIds.includes(g.id))
	}, [groups, teacherSubjects])

	return (
		<Card>
			<Row
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '20px',
				}}
			>
				<Col>
					<Select
						placeholder='Выберите группу'
						style={{ width: '300px', padding: '10px', fontSize: '18px' }}
						onChange={val => {
							setSelectedGroupId(val)
							setSelectedSubjectId(null)
						}}
						options={teacherGroups.map(g => ({ label: g.name, value: g.id }))}
					/>
				</Col>
				<Col>
					<Select
						placeholder='Выберите дисциплину'
						style={{ width: '300px', padding: '10px', fontSize: '18px' }}
						disabled={!selectedGroupId}
						value={selectedSubjectId}
						onChange={setSelectedSubjectId}
						options={teacherSubjects
							.filter(s => s.group_id === selectedGroupId)
							.map(s => ({ label: s.name, value: s.id }))}
					/>
				</Col>
				<Col>
						<DatePicker
							size='large'
							picker='month'
							value={selectedMonth}
							onChange={d => d && setSelectedMonth(d)}
							style={{ width: '280px', padding: '12px', fontSize: '18px' }}
						/>
				
				</Col>
			</Row>
		</Card>
	)
}
