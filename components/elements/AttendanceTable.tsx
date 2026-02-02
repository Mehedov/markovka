'use client'

import {
	useGetAttendanceQuery,
	useUpdateAttendanceMutation,
} from '@/services/attendance/attendanceApi'
import { useGetStudentsQuery } from '@/services/students/studentsApi'
import { formatName } from '@/utils/formatName'
import {
	CheckCircleFilled,
	CheckOutlined,
	CloseCircleFilled,
} from '@ant-design/icons'
import { User } from '@supabase/supabase-js'
import {
	Alert,
	Card,
	Col,
	Row,
	Statistic,
	Table,
	theme,
	Typography,
} from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

interface Props {
	selectedGroupId: string | null
	selectedSubjectId: string | null
	currentUser: User | null
}

const { Text } = Typography
dayjs.locale('ru')

export function AttendanceTable({
	selectedGroupId,
	selectedSubjectId,
	currentUser,
}: Props) {
	const { token } = theme.useToken()
	const { data: allStudents = [] } = useGetStudentsQuery()
	const { data: attendanceRecords = [] } = useGetAttendanceQuery()
	const [updateAttendance] = useUpdateAttendanceMutation()
	const [selectedMonth] = useState(dayjs())

	const studentsInGroup = useMemo(
		() => allStudents.filter(s => s.group_id === selectedGroupId),
		[allStudents, selectedGroupId],
	)

	const daysInMonth = useMemo(() => {
		const startOfMonth = selectedMonth.startOf('month')
		return Array.from({ length: selectedMonth.daysInMonth() }, (_, i) =>
			startOfMonth.add(i, 'day'),
		)
	}, [selectedMonth])

	const stats = useMemo(() => {
		if (!selectedSubjectId || !currentUser)
			return { presents: 0, total: 0, percent: 0 }

		const relevant = attendanceRecords.filter(
			r =>
				r.subject_id === selectedSubjectId &&
				r.teacher_id === currentUser.id &&
				studentsInGroup.some(s => s.id === r.student_id) &&
				dayjs(r.date).isSame(selectedMonth, 'month'),
		)
		const presents = relevant.filter(r => r.status === 'present').length
		const total = relevant.filter(
			r => r.status === 'present' || r.status === 'absent',
		).length
		return {
			presents,
			total,
			percent: total > 0 ? Math.round((presents / total) * 100) : 0,
		}
	}, [
		attendanceRecords,
		selectedSubjectId,
		studentsInGroup,
		selectedMonth,
		currentUser,
	])

	const handleToggle = async (studentId: string, dateStr: string) => {
		if (!selectedSubjectId || !currentUser) return

		const currentRecord = attendanceRecords.find(
			r =>
				r.student_id === studentId &&
				r.subject_id === selectedSubjectId &&
				r.date === dateStr &&
				r.teacher_id === currentUser.id,
		)

		const currentStatus = currentRecord?.status || 'none'
		const nextStatusMap: Record<string, string> = {
			none: 'present',
			present: 'absent',
			absent: 'none',
		}

		const statusToSave = nextStatusMap[currentStatus]

		// Вызываем мутацию (Optimistic UI сработает в API)
		await updateAttendance({
			student_id: studentId,
			subject_id: selectedSubjectId,
			date: dateStr,
			status: statusToSave,
			teacher_id: currentUser.id,
		})
	}

	const today = dayjs().format('YYYY-MM-DD')

	const columns = [
		{
			title: 'Студент',
			dataIndex: 'full_name',
			fixed: 'left' as const,
			width: 150,
			render: (text: string) => <Text strong>{formatName(text)}</Text>,
		},
		...daysInMonth.map(day => {
			const dateStr = day.format('YYYY-MM-DD')
			return {
				title: (
					<div style={{ fontSize: '12px' }}>
						{day.format('DD')}
						<br />
						<small>{day.format('dd')}</small>
					</div>
				),
				align: 'center' as const,
				width: 50,
				onCell: () => ({
					style:
						dateStr === today
							? {
									backgroundColor: token.colorPrimaryBg,
									borderInline: `1px solid ${token.colorPrimary}`,
								}
							: {},
				}),
				render: (_: unknown, record: { id: string }) => {
					const res = attendanceRecords.find(
						r =>
							r.student_id === record.id &&
							r.subject_id === selectedSubjectId &&
							r.date === dateStr &&
							r.teacher_id === currentUser?.id,
					)
					const status = res?.status || 'none'

					return (
						<div
							onClick={() => handleToggle(record.id, dateStr)}
							style={{ cursor: 'pointer' }}
						>
							{status === 'present' && (
								<CheckCircleFilled
									style={{ color: token.colorSuccess, fontSize: '20px' }}
								/>
							)}
							{status === 'absent' && (
								<CloseCircleFilled
									style={{ color: token.colorError, fontSize: '20px' }}
								/>
							)}
							{status === 'none' && (
								<div
									style={{
										width: 20,
										height: 20,
										border: '1px dashed #ccc',
										borderRadius: '50%',
										margin: '0 auto',
									}}
								/>
							)}
						</div>
					)
				},
			}
		}),
	]

	return selectedGroupId && selectedSubjectId ? (
		<>
			<Row gutter={16} style={{ marginBottom: '25px' }}>
				<Col span={12} md={3}>
					<Card>
						<Statistic
							title='Явка (за месяц)'
							value={stats.presents}
							prefix={<CheckOutlined />}
						/>
					</Card>
				</Col>
				<Col span={12} md={5}>
					<Card>
						<Statistic
							title='Процент посещаемости'
							value={stats.percent}
							suffix='%'
						/>
					</Card>
				</Col>
			</Row>
			<Table
				dataSource={studentsInGroup}
				columns={columns}
				rowKey='id'
				scroll={{ x: 'max-content' }}
				pagination={false}
				bordered
			/>
		</>
	) : (
		<Alert
			style={{ fontSize: '18px' }}
			title='Выберите группу и дисциплину для начала работы'
			type='info'
			showIcon
		/>
	)
}
