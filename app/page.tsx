'use client'

import {
	CheckCircleFilled,
	CheckOutlined,
	CloseCircleFilled,
} from '@ant-design/icons'
import {
	Alert,
	Button,
	Card,
	Col,
	DatePicker,
	Form,
	Input,
	message,
	Modal,
	Row,
	Select,
	Space,
	Statistic,
	Table,
	theme,
	Typography,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'

import { supabase } from '@/lib/supabase'
import {
	useGetAttendanceQuery,
	useUpdateAttendanceMutation,
} from '@/services/attendance/attendanceApi'
import { useGetGroupsQuery } from '@/services/group/groupApi'
import { useGetStudentsQuery } from '@/services/students/studentsApi'
import { useGetSubjectsQuery } from '@/services/subjects/subjectsApi'
import {
	useGetProfilesQuery,
	useGetTeacherRelationsQuery,
	useUpdateProfileMutation,
} from '@/services/teacher/teacherApi'
import { formatName } from '@/utils/formatName'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'

dayjs.locale('ru')
const { Text } = Typography

export default function AttendancePage() {
	const { token } = theme.useToken()

	// Состояния фильтров
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
	const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
		null,
	)
	const [selectedMonth, setSelectedMonth] = useState(dayjs())
	const [currentUser, setCurrentUser] = useState<any>(null)

	// Флаг для закрытия модалки после успешного ввода имени
	const [hasJustFinishedOnboarding, setHasJustFinishedOnboarding] =
		useState(false)

	// Данные из RTK Query
	const { data: groups = [] } = useGetGroupsQuery()
	const { data: allStudents = [] } = useGetStudentsQuery()
	const { data: allSubjects = [] } = useGetSubjectsQuery()
	const { data: attendanceRecords = [] } = useGetAttendanceQuery()
	const { data: relations = [] } = useGetTeacherRelationsQuery()

	// Добавляем refetch, чтобы принудительно обновить список профилей при логине
	const { data: profiles = [], refetch: refetchProfiles } =
		useGetProfilesQuery()

	const [updateAttendance] = useUpdateAttendanceMutation()
	const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()

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
	const myProfile = useMemo(
		() => profiles.find(p => p.id === currentUser?.id),
		[profiles, currentUser],
	)

	const shouldShowOnboarding = useMemo(() => {
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
			await updateProfile({
				id: currentUser.id,
				full_name: values.full_name,
			}).unwrap()

			message.success('Приятно познакомиться, ' + values.full_name)
			setHasJustFinishedOnboarding(true) // Мгновенно скрываем модалку
		} catch (e) {
			message.error('Не удалось сохранить имя')
		}
	}

	// ФИЛЬТРЫ И ЛОГИКА ТАБЛИЦЫ (БЕЗ ИЗМЕНЕНИЙ)
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
		if (!selectedSubjectId) return { presents: 0, total: 0, percent: 0 }
		const relevant = attendanceRecords.filter(
			r =>
				r.subject_id === selectedSubjectId &&
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
				onCell: () => {
					const isToday = dateStr === today
					return {
						style: isToday
							? {
									backgroundColor: token.colorPrimaryBg,
									borderInline: `1px solid ${token.colorPrimary}`,
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

	return (
		<Space direction='vertical' size='large' style={{ width: '100%' }}>
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

			{selectedGroupId && selectedSubjectId ? (
				<>
					<Row gutter={16}>
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
					style={{
						fontSize: '18px',
					}}
					title='Выберите группу и дисциплину для начала работы'
					type='info'
					showIcon
				/>
			)}

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
		</Space>
	)
}
