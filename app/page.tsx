'use client'

import {
	CalendarOutlined,
	CheckCircleFilled,
	CheckOutlined,
	CloseCircleFilled,
	SearchOutlined,
} from '@ant-design/icons'
import {
	Card,
	Col,
	DatePicker,
	Empty,
	Input,
	Progress,
	Row,
	Select,
	Space,
	Statistic,
	Table,
	theme,
	Typography,
} from 'antd'
import { useMemo, useState } from 'react'

// Импортируем хуки нашего API
import {
	useGetAttendanceQuery,
	useGetGroupsQuery,
	useGetStudentsQuery,
	useUpdateAttendanceMutation,
} from '@/services/api'

import dayjs from 'dayjs'
import 'dayjs/locale/ru'

dayjs.locale('ru')
const { Title, Text } = Typography

export default function AttendancePage() {
	const { token } = theme.useToken()

	// 1. Получаем данные с бэкенда через хуки
	const { data: groups = [] } = useGetGroupsQuery()
	const { data: students = [] } = useGetStudentsQuery()
	const { data: records = {} } = useGetAttendanceQuery()
	const [updateAttendance] = useUpdateAttendanceMutation()

	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
	const [searchName, setSearchName] = useState('')
	const [selectedMonth, setSelectedMonth] = useState(dayjs())

	const daysInMonth = useMemo(() => {
		const startOfMonth = selectedMonth.startOf('month')
		return Array.from({ length: selectedMonth.daysInMonth() }, (_, i) =>
			startOfMonth.add(i, 'day'),
		)
	}, [selectedMonth])

	const filteredStudents = useMemo(() => {
		return students.filter(s => {
			const matchGroup = selectedGroupId ? s.groupId === selectedGroupId : true
			const matchName = s.fullName
				.toLowerCase()
				.includes(searchName.toLowerCase())
			return matchGroup && matchName
		})
	}, [students, selectedGroupId, searchName])

	const stats = useMemo(() => {
		const monthKey = selectedMonth.format('YYYY-MM')
		const studentIds = new Set(filteredStudents.map(s => s.id))

		const relevantKeys = Object.keys(records).filter(
			key => key.includes(monthKey) && studentIds.has(key.split('_')[0]),
		)

		const presents = relevantKeys.filter(k => records[k] === 'present').length
		const absents = relevantKeys.filter(k => records[k] === 'absent').length
		const total = presents + absents

		return {
			presents,
			total,
			percent: total > 0 ? Math.round((presents / total) * 100) : 0,
		}
	}, [records, selectedMonth, filteredStudents])

	// Логика переключения статуса через сервер
	const handleToggle = async (studentId: string, date: string) => {
		const key = `${studentId}_${date}`
		const currentStatus = records[key] || 'none'

		const nextStatusMap: Record<string, string> = {
			none: 'present',
			present: 'absent',
			absent: 'none',
		}

		// Отправляем PATCH запрос на сервер
		await updateAttendance({
			key,
			status: nextStatusMap[currentStatus],
		})
	}

	const columns = [
		{
			title: 'Студент',
			dataIndex: 'fullName',
			key: 'name',
			fixed: 'left' as const,
			width: 220,
			render: (text: string) => (
				<Text strong style={{ color: token.colorPrimary }}>
					{text}
				</Text>
			),
		},
		...daysInMonth.map(day => {
			const dateStr = day.format('YYYY-MM-DD')
			const isWeekend = day.day() === 0 || day.day() === 6
			const isToday = day.isSame(dayjs(), 'day')

			return {
				title: (
					<div
						style={{
							textAlign: 'center',
							padding: '4px 0',
							background: isToday ? `${token.colorPrimary}22` : 'transparent',
							borderRadius: 8,
							border: isToday ? `1px solid ${token.colorPrimary}` : 'none',
						}}
					>
						<div
							style={{
								fontSize: '12px',
								color: isWeekend ? token.colorError : 'inherit',
							}}
						>
							{day.format('DD')}
						</div>
						<div style={{ fontSize: '10px', opacity: 0.6 }}>
							{day.format('dd')}
						</div>
					</div>
				),
				key: dateStr,
				width: 55,
				align: 'center' as const,
				render: (_: any, record: any) => {
					const status = records[`${record.id}_${dateStr}`] || 'none'
					return (
						<div
							onClick={() => handleToggle(record.id, dateStr)}
							style={{ cursor: 'pointer', fontSize: '18px' }}
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
										width: 16,
										height: 16,
										border: `1px dashed ${token.colorBorder}`,
										borderRadius: '50%',
										margin: '0 auto',
										opacity: 0.5,
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
		<Space direction='vertical' size='large' style={{ width: '100%' }}>
			<Card bordered={false}>
				<Row gutter={[16, 16]} align='middle'>
					<Col xs={24} lg={8}>
						<Title level={4} style={{ margin: 0 }}>
							Учет посещаемости
						</Title>
					</Col>
					<Col xs={24} md={8} lg={5}>
						<Select
							placeholder='Группа'
							style={{ width: '100%' }}
							allowClear
							onChange={setSelectedGroupId}
							options={groups.map((g: any) => ({ label: g.name, value: g.id }))}
						/>
					</Col>
					<Col xs={24} md={8} lg={6}>
						<Input
							placeholder='Поиск...'
							prefix={<SearchOutlined />}
							onChange={e => setSearchName(e.target.value)}
						/>
					</Col>
					<Col xs={24} md={8} lg={5}>
						<DatePicker
							picker='month'
							value={selectedMonth}
							onChange={d => d && setSelectedMonth(d)}
							format='MMMM YYYY'
							style={{ width: '100%' }}
						/>
					</Col>
				</Row>
			</Card>

			{selectedGroupId || searchName ? (
				<>
					<Row gutter={[16, 16]}>
						<Col span={8}>
							<Card>
								<Statistic
									title='Всего'
									value={stats.total}
									prefix={<CalendarOutlined />}
								/>
							</Card>
						</Col>
						<Col span={8}>
							<Card>
								<Statistic
									title='Явка'
									value={stats.presents}
									valueStyle={{ color: token.colorSuccess }}
									prefix={<CheckOutlined />}
								/>
							</Card>
						</Col>
						<Col span={8}>
							<Card>
								<Progress
									percent={stats.percent}
									strokeColor={token.colorPrimary}
								/>
							</Card>
						</Col>
					</Row>
					<Card bordered={false} bodyStyle={{ padding: 0 }}>
						<Table
							dataSource={filteredStudents}
							columns={columns}
							rowKey='id'
							scroll={{ x: 'max-content' }}
							pagination={false}
							bordered
						/>
					</Card>
				</>
			) : (
				<Empty description='Выберите группу' style={{ marginTop: 100 }} />
			)}
		</Space>
	)
}
