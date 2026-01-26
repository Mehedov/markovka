'use client'


import { useAddGroupMutation, useDeleteGroupMutation, useGetGroupsQuery } from '@/services/group/groupApi'
import { useAddStudentMutation, useDeleteStudentMutation, useGetStudentsQuery } from '@/services/students/studentsApi'
import { useAddSubjectMutation, useDeleteSubjectMutation, useGetSubjectsQuery } from '@/services/subjects/subjectsApi'
import {
	BookOutlined,
	DeleteOutlined,
	TeamOutlined,
	UserAddOutlined,
} from '@ant-design/icons'
import {
	Button,
	Card,
	Col,
	Divider,
	Form,
	Input,
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

	// Данные
	const { data: groups = [] } = useGetGroupsQuery()
	const { data: students = [] } = useGetStudentsQuery()
	const { data: subjects = [] } = useGetSubjectsQuery()

	// Мутации
	const [addGroup] = useAddGroupMutation()
	const [deleteGroup] = useDeleteGroupMutation()
	const [addStudent] = useAddStudentMutation()
	const [deleteStudent] = useDeleteStudentMutation()
	const [addSubject] = useAddSubjectMutation()
	const [deleteSubject] = useDeleteSubjectMutation()

	// Обработчики создания
	const onGroupFinish = async (values: any) => {
		await addGroup(values).unwrap()
		groupForm.resetFields()
		message.success('Группа создана')
	}

	const onStudentFinish = async (values: any) => {
		await addStudent(values).unwrap()
		studentForm.resetFields(['full_name'])
		message.success('Студент добавлен')
	}

	const onSubjectFinish = async (values: any) => {
		await addSubject(values).unwrap()
		subjectForm.resetFields(['name'])
		message.success('Дисциплина добавлена')
	}

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
			render: (_: any, record: any) => (
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
			render: (_: any, record: any) => (
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
				{/* Секция Групп */}
				<Col xs={24} lg={8}>
					<Card
						title={
							<Space>
								<TeamOutlined /> Группы
							</Space>
						}
						variant='bordered'
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
						<div style={{ maxHeight: 300, overflowY: 'auto' }}>
							{groups.map((g: any) => (
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

			<Divider orientation='left'>Общий реестр</Divider>

			<Row gutter={[24, 24]}>
				<Col xs={24} xl={12}>
					<Title level={4}>Дисциплины по группам</Title>
					<Table
						dataSource={subjects}
						columns={subjectColumns}
						rowKey='id'
						pagination={{ pageSize: 5 }}
					/>
				</Col>
				<Col xs={24} xl={12}>
					<Title level={4}>Список всех студентов</Title>
					<Table
						dataSource={students}
						columns={studentColumns}
						rowKey='id'
						pagination={{ pageSize: 5 }}
					/>
				</Col>
			</Row>
		</div>
	)
}
