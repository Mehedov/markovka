'use client'

import {
	CheckCircleFilled,
	CheckOutlined,
	CloseCircleFilled,
} from '@ant-design/icons'
import {
	Alert,
	Card,
	Col,
	DatePicker,
	Row,
	Select,
	Space,
	Statistic,
	Table,
	theme,
	Typography,
} from 'antd'
import { useMemo, useState } from 'react'

import {
	useGetAttendanceQuery,
	useUpdateAttendanceMutation,
} from '@/services/attendance/attendanceApi'
import { useGetGroupsQuery } from '@/services/group/groupApi'
import { useGetStudentsQuery } from '@/services/students/studentsApi'
import { useGetSubjectsQuery } from '@/services/subjects/subjectsApi'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'

dayjs.locale('ru')
const { Title, Text } = Typography

export default function AttendancePage() {
	const { token } = theme.useToken()

	// Состояния фильтров
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
	const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
		null,
	)
	const [selectedMonth, setSelectedMonth] = useState(dayjs())

	// Данные из RTK Query (Supabase)
	const { data: groups = [] } = useGetGroupsQuery()
	const { data: allStudents = [] } = useGetStudentsQuery()
	const { data: allSubjects = [] } = useGetSubjectsQuery()
	const { data: attendanceRecords = [] } = useGetAttendanceQuery()
	const [updateAttendance] = useUpdateAttendanceMutation()

	// Фильтруем дисциплины по выбранной группе
	const filteredSubjects = useMemo(
		() => allSubjects.filter(sub => sub.group_id === selectedGroupId),
		[allSubjects, selectedGroupId],
	)

	// Фильтруем студентов по выбранной группе
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

	// Расчет статистики для выбранной группы и дисциплины
	const stats = useMemo(() => {
		if (!selectedSubjectId) return { presents: 0, total: 0, percent: 0 }

		const relevant = attendanceRecords.filter(
			r =>
				r.subject_id === selectedSubjectId &&
				studentsInGroup.some(s => s.id === r.student_id) &&
				dayjs(r.date).isSame(selectedMonth, 'month'),
		)

		const presents = relevant.filter(r => r.status === 'present').length
		const absents = relevant.filter(r => r.status === 'absent').length
		const total = presents + absents

		return {
			presents,
			total,
			percent: total > 0 ? Math.round((presents / total) * 100) : 0,
		}
	}, [attendanceRecords, selectedSubjectId, studentsInGroup, selectedMonth])

	const handleToggle = async (studentId: string, dateStr: string) => {
		if (!selectedSubjectId) return

		const currentRecord = attendanceRecords.find(
			r =>
				r.student_id === studentId &&
				r.subject_id === selectedSubjectId &&
				r.date === dateStr,
		)

		const currentStatus = currentRecord?.status || 'none'
		const nextStatusMap: Record<string, string> = {
			none: 'present',
			present: 'absent',
			absent: 'none',
		}

		await updateAttendance({
			student_id: studentId,
			subject_id: selectedSubjectId,
			date: dateStr,
			status: nextStatusMap[currentStatus],
		})
	}

	const today = dayjs().format('YYYY-MM-DD')

	const columns = [
		{
			title: 'Студент',
			dataIndex: 'full_name',
			fixed: 'left' as const,
			width: 200,
			render: (text: string) => <Text strong>{text}</Text>,
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
				onCell: () => {
					// Сравниваем строки формата 'YYYY-MM-DD'
					const isToday = day.format('YYYY-MM-DD') === today

					return {
						style: isToday
							? {
									// Используем токены темы напрямую
									backgroundColor: token.colorPrimaryBg, // Светлый фон (предустановлен в AntD)
									borderInline: `1px solid ${token.colorPrimary}`, // Рамка вашего цвета
									transition: 'all 0.3s', // Чтобы подсветка появлялась плавно
								}
							: {},
					}
				},
				render: (_: unknown, record: { id: string }) => {
					const res = attendanceRecords.find(
						r =>
							r.student_id === record.id &&
							r.subject_id === selectedSubjectId &&
							r.date === dateStr,
					)
					const status = res?.status || 'none'
					return (
						<div
							onClick={() => handleToggle(record.id, dateStr)}
							style={{ cursor: 'pointer' }}
						>
							{status === 'present' && (
								<CheckCircleFilled style={{ color: token.colorSuccess }} />
							)}
							{status === 'absent' && (
								<CloseCircleFilled style={{ color: token.colorError }} />
							)}
							{status === 'none' && (
								<div
									style={{
										width: 14,
										height: 14,
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

	return (
		<Space orientation='vertical' size='large' style={{ width: '100%' }}>
			<Card>
				<Row gutter={[16, 16]}>
					<Col xs={24} md={6}>
						<Select
							placeholder='Выберите группу'
							style={{ width: '100%' }}
							onChange={val => {
								setSelectedGroupId(val)
								setSelectedSubjectId(null)
							}}
							options={groups.map(g => ({ label: g.name, value: g.id }))}
						/>
					</Col>
					<Col xs={24} md={6}>
						<Select
							placeholder='Выберите дисциплину'
							style={{ width: '100%' }}
							disabled={!selectedGroupId}
							value={selectedSubjectId}
							onChange={setSelectedSubjectId}
							options={filteredSubjects.map(s => ({
								label: s.name,
								value: s.id,
							}))}
						/>
					</Col>
					<Col xs={24} md={6}>
						<DatePicker
							picker='month'
							value={selectedMonth}
							onChange={d => d && setSelectedMonth(d)}
							style={{ width: '100%' }}
						/>
					</Col>
				</Row>
			</Card>

			{selectedGroupId && selectedSubjectId ? (
				<>
					<Row gutter={16}>
						<Col span={8}>
							<Card>
								<Statistic
									title='Явка (за месяц)'
									value={stats.presents}
									prefix={<CheckOutlined />}
								/>
							</Card>
						</Col>
						<Col span={8}>
							<Card>
								<div>Процент посещаемости</div>
								<div
									style={{
										fontSize: '20px',
									}}
								>
									{stats.presents}%
								</div>
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
					title='Выберите группу и дисциплину для начала работы'
					type='info'
					showIcon
				/>
			)}
		</Space>
	)
}
