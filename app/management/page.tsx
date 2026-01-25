'use client'

import {
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
	Row,
	Select,
	Space,
	Table,
	Typography,
} from 'antd'
// Импортируем хуки API
import {
	useAddGroupMutation,
	useAddStudentMutation,
	useDeleteStudentMutation,
	useGetGroupsQuery,
	useGetStudentsQuery,
} from '@/services/api'

const { Title } = Typography

export default function ManagementPage() {
	const [groupForm] = Form.useForm()
	const [studentForm] = Form.useForm()
	const [deleteStudent] = useDeleteStudentMutation()

	// Получаем данные и функции мутации
	const { data: groups = [] } = useGetGroupsQuery()
	const { data: students = [] } = useGetStudentsQuery()
	const [addGroup] = useAddGroupMutation()
	const [addStudent] = useAddStudentMutation()

	const onGroupFinish = async (values: { name: string }) => {
		try {
			await addGroup(values).unwrap()
			groupForm.resetFields()
			message.success(`Группа создана`)
		} catch {
			message.error('Ошибка при создании группы')
		}
	}

	const onStudentFinish = async (values: {
		fullName: string
		groupId: string
	}) => {
		try {
			await addStudent(values).unwrap()
			studentForm.resetFields(['fullName'])
			message.success('Студент зачислен')
		} catch {
			message.error('Ошибка при добавлении студента')
		}
	}

	const columns = [
		{ title: 'ФИО Студента', dataIndex: 'fullName', key: 'fullName' },
		{
			title: 'Группа',
			dataIndex: 'groupId',
			key: 'groupId',
			render: (id: string) => groups.find(g => g.id === id)?.name || '—',
		},
		{
			title: 'Действие',
			key: 'action',
			render: (_: any, record: any) => (
				<Button
					danger
					type='text'
					icon={<DeleteOutlined />}
					onClick={() => deleteStudent(record.id)}
				>
					Удалить
				</Button>
			),
		},
	]

	return (
		<div style={{ maxWidth: 1200, margin: '0 auto' }}>
			<Title level={2}>Управление</Title>

			<Row gutter={[24, 24]}>
				<Col xs={24} md={12}>
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
								label='Название'
								rules={[{ required: true }]}
							>
								<Input placeholder='Напр: ИТ-24' />
							</Form.Item>
							<Button type='primary' htmlType='submit' block>
								Создать
							</Button>
						</Form>
					</Card>
				</Col>

				<Col xs={24} md={12}>
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
								name='groupId'
								label='Группа'
								rules={[{ required: true }]}
							>
								<Select placeholder='Выбор'>
									{groups.map(g => (
										<Select.Option key={g.id} value={g.id}>
											{g.name}
										</Select.Option>
									))}
								</Select>
							</Form.Item>
							<Form.Item
								name='fullName'
								label='ФИО'
								rules={[{ required: true }]}
							>
								<Input placeholder='Имя Фамилия' />
							</Form.Item>
							<Button type='primary' htmlType='submit' block ghost>
								Добавить
							</Button>
						</Form>
					</Card>
				</Col>
			</Row>

			<Divider />
			<Table dataSource={students} columns={columns} rowKey='id' />
		</div>
	)
}
