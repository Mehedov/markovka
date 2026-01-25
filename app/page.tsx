'use client'

import { RootState } from '@/store'
import { toggleAttendance } from '@/store/slices/attendanceSlice'
import {
	CheckCircleFilled,
	CloseCircleFilled,
	SearchOutlined,
} from '@ant-design/icons'
import {
	Card,
	DatePicker,
	Empty,
	Input,
	Select,
	Space,
	Table,
	Typography,
} from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

dayjs.locale('ru')

const { Title } = Typography

export default function AttendancePage() {
	const dispatch = useDispatch()

	// Данные из Redux
	const { groups, students, records } = useSelector(
		(state: RootState) => state.attendance,
	)

	// Локальное состояние фильтров
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
	const [searchName, setSearchName] = useState('')
	const [selectedMonth, setSelectedMonth] = useState(dayjs())

	// 1. Генерируем дни выбранного месяца
	const daysInMonth = useMemo(() => {
		const startOfMonth = selectedMonth.startOf('month')
		const daysCount = selectedMonth.daysInMonth()
		return Array.from({ length: daysCount }, (_, i) =>
			startOfMonth.add(i, 'day'),
		)
	}, [selectedMonth])

	// 2. Фильтруем студентов
	const filteredStudents = useMemo(() => {
		return students.filter(s => {
			const matchGroup = selectedGroupId ? s.groupId === selectedGroupId : true
			const matchName = s.fullName
				.toLowerCase()
				.includes(searchName.toLowerCase())
			return matchGroup && matchName
		})
	}, [students, selectedGroupId, searchName])

	// 3. Функция переключения статуса
	const handleToggle = (studentId: string, date: string) => {
		dispatch(toggleAttendance({ key: `${studentId}_${date}` }))
	}

	// 4. Описание колонок таблицы
	const columns = [
		{
			title: 'Студент',
			dataIndex: 'fullName',
			key: 'name',
			fixed: 'left' as const,
			width: 200,
			render: (text: string) => <b>{text}</b>,
		},
		...daysInMonth.map(day => {
			const dateStr = day.format('YYYY-MM-DD')
			const isWeekend = day.day() === 0 || day.day() === 6

			return {
				title: (
					<div
						style={{
							textAlign: 'center',
							fontSize: '12px',
							color: isWeekend ? '#ff4d4f' : 'inherit',
						}}
					>
						<div>{day.format('DD')}</div>
						<div style={{ fontSize: '10px', textTransform: 'uppercase' }}>
							{day.format('dd')}
						</div>
					</div>
				),
				key: dateStr,
				width: 50,
				align: 'center' as const,
				render: (_: any, record: any) => {
					const status = records[`${record.id}_${dateStr}`] || 'none'

					return (
						<div
							onClick={() => handleToggle(record.id, dateStr)}
							style={{ cursor: 'pointer', fontSize: '20px' }}
						>
							{status === 'present' && (
								<CheckCircleFilled style={{ color: '#52c41a' }} />
							)}
							{status === 'absent' && (
								<CloseCircleFilled style={{ color: '#ff4d4f' }} />
							)}
							{status === 'none' && (
								<div
									style={{
										width: 20,
										height: 20,
										border: '1px dashed #d9d9d9',
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
		<Space direction='vertical' size='large' style={{ width: '100%' }}>
			<Card bordered={false}>
				<Title level={3}>Учет посещаемости</Title>
				<div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
					<Select
						placeholder='Выберите группу'
						style={{ width: 200 }}
						allowClear
						onChange={setSelectedGroupId}
						options={groups.map(g => ({ label: g.name, value: g.id }))}
					/>
					<Input
						placeholder='Поиск по ФИО'
						prefix={<SearchOutlined />}
						style={{ width: 250 }}
						onChange={e => setSearchName(e.target.value)}
					/>
					<DatePicker
						picker='month'
						value={selectedMonth}
						onChange={date => date && setSelectedMonth(date)}
						format='MMMM YYYY'
						allowClear={false}
					/>
				</div>
			</Card>

			{selectedGroupId || searchName ? (
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
			) : (
				<Empty
					description='Выберите группу или введите имя для начала работы'
					style={{ marginTop: 100 }}
				/>
			)}
		</Space>
	)
}
