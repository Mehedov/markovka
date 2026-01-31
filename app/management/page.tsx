'use client'

import {
	useAddGroupMutation,
	useDeleteGroupMutation,
	useGetGroupsQuery,
} from '@/services/group/groupApi'
import {
	useAddStudentMutation,
	useDeleteStudentMutation,
	useGetStudentsQuery,
} from '@/services/students/studentsApi'
import {
	useAddSubjectMutation,
	useDeleteSubjectMutation,
	useGetSubjectsQuery,
} from '@/services/subjects/subjectsApi'
import {
	useAssignSubjectToTeacherMutation,
	useGetProfilesQuery,
	useGetTeacherRelationsQuery,
	useRemoveTeacherRelationMutation,
} from '@/services/teacher/teacherApi'
import { Group } from '@/types/attendance'
import {
	BookOutlined,
	DeleteOutlined,
	LinkOutlined,
	TeamOutlined,
	UserAddOutlined,
	UserOutlined,
} from '@ant-design/icons'
import {
	Button,
	Card,
	Col,
	Divider,
	Form,
	Input,
	List,
	message,
	Popconfirm,
	Row,
	Select,
	Space,
	Table,
	Typography,
} from 'antd'

const { Title, Text } = Typography

export default function ManagementPage() {
	const [groupForm] = Form.useForm()
	const [studentForm] = Form.useForm()
	const [subjectForm] = Form.useForm()
	const [form] = Form.useForm()

	// Данные
	const { data: groups = [] } = useGetGroupsQuery()
	const { data: students = [] } = useGetStudentsQuery()
	const { data: subjects = [] } = useGetSubjectsQuery()
	const { data: relations = [] } = useGetTeacherRelationsQuery()

	// Сделай так:
	const { data: profiles = [], refetch: refetchProfiles } = useGetProfilesQuery(
		undefined,
		{
			refetchOnMountOrArgChange: true,
		},
	)

	// Мутации
	const [addGroup] = useAddGroupMutation()
	const [deleteGroup] = useDeleteGroupMutation()
	const [addStudent] = useAddStudentMutation()
	const [deleteStudent] = useDeleteStudentMutation()
	const [addSubject] = useAddSubjectMutation()
	const [deleteSubject] = useDeleteSubjectMutation()
	const [assignSubject] = useAssignSubjectToTeacherMutation()
	const [removeRelation] = useRemoveTeacherRelationMutation()

	const onAssignFinish = async (values: any) => {
		try {
			await assignSubject(values).unwrap()
			message.success('Предмет закреплен за учителем')
			form.resetFields(['subject_id'])
		} catch (e) {
			message.error('Ошибка: возможно связь уже существует')
		}
	}

	// Обработчики создания
	const onGroupFinish = async (values: { name: string }) => {
		await addGroup(values).unwrap()
		console.log('1')
		groupForm.resetFields()
		console.log('1>2')
		message.success('Группа создана')
	}

	const onStudentFinish = async (values: { full_name: string }) => {
		await addStudent(values).unwrap()
		studentForm.resetFields(['full_name'])
		message.success('Студент добавлен')
	}

	const onSubjectFinish = async (values: { name: string }) => {
		await addSubject(values).unwrap()
		subjectForm.resetFields(['name'])
		message.success('Дисциплина добавлена')
	}

	const isActivePagination = students.length > 5 ? { pageSize: 5 } : false

	// Колонки таблиц
	const studentColumns = [
		{ title: 'ФИО Студента', dataIndex: 'full_name', key: 'full_name' },
		{
			title: 'Группа',
			dataIndex: 'group_id',
			render: (id: string) => groups.find(g => g.id === id)?.name || '—',
		},
		{
			title: 'Действие',
			render: (_: unknown, record: { id: string }) => (
				<Popconfirm
					title='Удалить студента?'
					onConfirm={() => deleteStudent(record.id)}
				>
					<Button type='text' danger icon={<DeleteOutlined />} />
				</Popconfirm>
			),
		},
	]

	const subjectColumns = [
		{ title: 'Дисциплина', dataIndex: 'name', key: 'name' },
		{
			title: 'Для группы',
			dataIndex: 'group_id',
			render: (id: string) => groups.find(g => g.id === id)?.name || '—',
		},
		{
			title: 'Действие',
			render: (_: unknown, record: { id: string }) => (
				<Popconfirm
					title='Удалить дисциплину?'
					onConfirm={() => deleteSubject(record.id)}
				>
					<Button type='text' danger icon={<DeleteOutlined />} />
				</Popconfirm>
			),
		},
	]
	return (
		<div style={{ padding: '24px' }}>
			<Title level={2}>Панель управления</Title>

			<Row gutter={[24, 24]}>
				{/* Форма назначения */}
				<Col xs={24} lg={12}>
					<Card
						title={
							<Space>
								<LinkOutlined /> Назначить предмет учителю
							</Space>
						}
					>
						<Form form={form} layout='vertical' onFinish={onAssignFinish}>
							<Form.Item
								name='teacher_id'
								label='Выберите учителя'
								rules={[{ required: true }]}
							>
								<Select placeholder='Email учителя'>
									{profiles.map(p => (
										<Select.Option key={p.id} value={p.id}>
											{p.email}
										</Select.Option>
									))}
								</Select>
							</Form.Item>
							<Form.Item
								name='subject_id'
								label='Выберите предмет'
								rules={[{ required: true }]}
							>
								<Select placeholder='Предмет (Группа)'>
									{subjects.map(s => (
										<Select.Option key={s.id} value={s.id}>
											{s.name} ({groups.find(g => g.id === s.group_id)?.name})
										</Select.Option>
									))}
								</Select>
							</Form.Item>
							<Button type='primary' htmlType='submit' block>
								Закрепить
							</Button>
						</Form>
					</Card>
				</Col>

				{/* Список текущих связей */}
				<Col xs={24} lg={12}>
					<Card title='Текущие доступы'>
						<List
							dataSource={relations}
							style={{maxHeight: '200px', overflowY: 'auto'}}
							renderItem={rel => {
								const teacher = profiles.find(p => p.id === rel.teacher_id)
								const subject = subjects.find(s => s.id === rel.subject_id)
								return (
									<List.Item
										actions={[
											<Button
												key={rel}
												type='text'
												danger
												icon={<DeleteOutlined />}
												onClick={() => removeRelation(rel.id)}
											/>,
										]}
									>
										<List.Item.Meta
											avatar={<UserOutlined />}
											title={teacher?.full_name || teacher?.email}
											description={`${subject?.name} — ${groups.find(g => g.id === subject?.group_id)?.name}`}
										/>
									</List.Item>
								)
							}}
						/>
					</Card>
				</Col>
					{/* Секция Групп */}
				<Col xs={24} lg={8}>
					<Card
						title={
							<Space>
								<TeamOutlined /> Группы
							</Space>
						}
					>
						<Form form={groupForm} layout='vertical' onFinish={onGroupFinish}>
							<Form.Item
								name='name'
								label='Название группы'
								rules={[{ required: true }]}
							>
								<Input placeholder='Напр: ИТ-24' />
							</Form.Item>
							<Button type='primary' htmlType='submit' block>
								Создать группу
							</Button>
						</Form>
						<Divider>Список групп</Divider>
						<div style={{ maxHeight: 200, overflowY: 'auto' }}>
							{groups.map((g: Group) => (
								<div
									key={g.id}
									style={{
										display: 'flex',
										justifyContent: 'space-between',
										marginBottom: 8,
									}}
								>
									<Text>{g.name}</Text>
									<Popconfirm
										title='Удалить группу и всех её студентов?'
										onConfirm={() => deleteGroup(g.id)}
									>
										<Button
											type='text'
											danger
											icon={<DeleteOutlined />}
											size='small'
										/>
									</Popconfirm>
								</div>
							))}
						</div>
					</Card>
				</Col>

				{/* Секция Дисциплин */}
				<Col xs={24} lg={8}>
					<Card
						title={
							<Space>
								<BookOutlined /> Дисциплины
							</Space>
						}
					>
						<Form
							form={subjectForm}
							layout='vertical'
							onFinish={onSubjectFinish}
						>
							<Form.Item
								name='group_id'
								label='Группа'
								rules={[{ required: true }]}
							>
								<Select placeholder='Выберите группу'>
									{groups.map(g => (
										<Select.Option key={g.id} value={g.id}>
											{g.name}
										</Select.Option>
									))}
								</Select>
							</Form.Item>
							<Form.Item
								name='name'
								label='Название дисциплины'
								rules={[{ required: true }]}
							>
								<Input placeholder='Напр: Высшая математика' />
							</Form.Item>
							<Button type='primary' htmlType='submit' block ghost>
								Добавить предмет
							</Button>
						</Form>
					</Card>
				</Col>

				{/* Секция Студентов */}
				<Col xs={24} lg={8}>
					<Card
						title={
							<Space>
								<UserAddOutlined /> Студенты
							</Space>
						}
					>
						<Form
							form={studentForm}
							layout='vertical'
							onFinish={onStudentFinish}
						>
							<Form.Item
								name='group_id'
								label='Группа'
								rules={[{ required: true }]}
							>
								<Select placeholder='Выберите группу'>
									{groups.map(g => (
										<Select.Option key={g.id} value={g.id}>
											{g.name}
										</Select.Option>
									))}
								</Select>
							</Form.Item>
							<Form.Item
								name='full_name'
								label='ФИО Студента'
								rules={[{ required: true }]}
							>
								<Input placeholder='Иван Иванов' />
							</Form.Item>
							<Button type='primary' htmlType='submit' block ghost>
								Зачислить студента
							</Button>
						</Form>
					</Card>
				</Col>
			</Row>

			<Row gutter={[24, 24]}>
				<Col xs={24} xl={12}>
					<Title level={4}>Дисциплины по группам</Title>
					<Table
						dataSource={subjects}
						columns={subjectColumns}
						rowKey='id'
						pagination={isActivePagination}
					/>
				</Col>
				<Col xs={24} xl={12}>
					<Title level={4}>Список всех студентов</Title>
					<Table
						dataSource={students}
						columns={studentColumns}
						rowKey='id'
						pagination={isActivePagination}
					/>
				</Col>
			</Row>
		</div>
	)
}
