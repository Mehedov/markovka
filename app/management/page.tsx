'use client'

import { useGetAttendanceQuery } from '@/services/attendance/attendanceApi'
import { useGetGroupsQuery } from '@/services/group/groupApi'
import { useGetStudentsQuery } from '@/services/students/studentsApi'
import { useGetSubjectsQuery } from '@/services/subjects/subjectsApi'
import {
	BookOutlined,
	CalendarOutlined,
	TeamOutlined,
	UserOutlined,
} from '@ant-design/icons'
import { Card, Col, Row, Statistic, Typography } from 'antd'
import Link from 'next/link'

const { Title } = Typography

export default function ManagementDashboard() {
	const { data: students = [] } = useGetStudentsQuery()
	const { data: groups = [] } = useGetGroupsQuery()
	const { data: subjects = [] } = useGetSubjectsQuery()
	const { data: attendance = [] } = useGetAttendanceQuery()

	// Подсчет статистики
	const totalStudents = students.length
	const totalGroups = groups.length
	const totalSubjects = subjects.length
	const totalAttendanceRecords = attendance.length

	return (
		<div style={{ padding: '24px' }}>
			<Title level={2}>Панель управления</Title>

			<Row gutter={[24, 24]} style={{ marginTop: 24 }}>
				<Col xs={24} sm={12} lg={6}>
					<Link href='/management/students'>
						<Card hoverable>
							<Statistic
								title='Всего студентов'
								value={totalStudents}
								prefix={<UserOutlined />}
								valueStyle={{ color: '#3f8600' }}
							/>
						</Card>
					</Link>
				</Col>

				<Col xs={24} sm={12} lg={6}>
					<Link href='/management/groups'>
						<Card hoverable>
							<Statistic
								title='Всего групп'
								value={totalGroups}
								prefix={<TeamOutlined />}
								valueStyle={{ color: '#1890ff' }}
							/>
						</Card>
					</Link>
				</Col>

				<Col xs={24} sm={12} lg={6}>
					<Link href='/management/subjects'>
						<Card hoverable>
							<Statistic
								title='Всего предметов'
								value={totalSubjects}
								prefix={<BookOutlined />}
								valueStyle={{ color: '#722ed1' }}
							/>
						</Card>
					</Link>
				</Col>

				<Col xs={24} sm={12} lg={6}>
					<Link href='/'>
						<Card hoverable>
							<Statistic
								title='Записей посещ.'
								value={totalAttendanceRecords}
								prefix={<CalendarOutlined />}
								valueStyle={{ color: '#52c41a' }}
							/>
						</Card>
					</Link>
				</Col>
			</Row>

			<Row gutter={[24, 24]} style={{ marginTop: 24 }}>
				<Col xs={24} lg={12}>
					<Card title='Быстрые действия'>
						<p>Из бокового меню вы можете управлять:</p>
						<ul>
							<li>Группами студентов</li>
							<li>Списком студентов</li>
							<li>Учебными предметами</li>
							<li>Назначением преподавателей</li>
						</ul>
					</Card>
				</Col>

				<Col xs={24} lg={12}>
					<Card title='Статус системы'>
						<p>Все сервисы работают в штатном режиме</p>
						<p>
							Последнее обновление данных: {new Date().toLocaleString('ru-RU')}
						</p>
					</Card>
				</Col>
			</Row>
		</div>
	)
}
