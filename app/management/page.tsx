'use client'

import { RootState } from '@/store'
import { addGroup, addStudent } from '@/store/slices/attendanceSlice'
import { TeamOutlined, UserAddOutlined } from '@ant-design/icons'
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
import { useDispatch, useSelector } from 'react-redux'
import { v4 as uuidv4 } from 'uuid' // Можно использовать crypto.randomUUID()

const { Title } = Typography

export default function ManagementPage() {
	const dispatch = useDispatch()
	const [groupForm] = Form.useForm()
	const [studentForm] = Form.useForm()

	const groups = useSelector((state: RootState) => state.attendance.groups)
	const students = useSelector((state: RootState) => state.attendance.students)

	// Добавление группы
	const onGroupFinish = (values: { name: string }) => {
		const newGroup = { id: uuidv4(), name: values.name }
		dispatch(addGroup(newGroup))
		groupForm.resetFields()
		message.success(`Группа "${values.name}" создана`)
	}

	// Добавление студента
	const onStudentFinish = (values: { fullName: string; groupId: string }) => {
		const newStudent = {
			id: uuidv4(),
			fullName: values.fullName,
			groupId: values.groupId,
		}
		dispatch(addStudent(newStudent))
		studentForm.resetFields(['fullName']) // Очищаем только имя, чтобы группу не выбирать заново
		message.success('Студент добавлен')
	}

	const columns = [
		{ title: 'ФИО Студента', dataIndex: 'fullName', key: 'fullName' },
		{
			title: 'Группа',
			dataIndex: 'groupId',
			key: 'groupId',
			render: (groupId: string) =>
				groups.find(g => g.id === groupId)?.name || 'Неизвестно',
		},
	]

	return (
		<div style={{ maxWidth: 1200, margin: '0 auto' }}>
			<Title level={2}>Управление данными</Title>

			<Row gutter={[24, 24]}>
				{/* Форма создания группы */}
				<Col xs={24} md={12}>
					<Card
						title={
							<Space>
								<TeamOutlined /> Создать группу
							</Space>
						}
						bordered={false}
					>
						<Form form={groupForm} layout='vertical' onFinish={onGroupFinish}>
							<Form.Item
								name='name'
								label='Название группы'
								rules={[{ required: true }]}
							>
								<Input placeholder='Например: ИТ-24' />
							</Form.Item>
							<Button type='primary' htmlType='submit' block>
								Добавить группу
							</Button>
						</Form>
					</Card>
				</Col>

				{/* Форма добавления студента */}
				<Col xs={24} md={12}>
					<Card
						title={
							<Space>
								<UserAddOutlined /> Добавить студента
							</Space>
						}
						bordered={false}
					>
						<Form
							form={studentForm}
							layout='vertical'
							onFinish={onStudentFinish}
						>
							<Form.Item
								name='groupId'
								label='Выбор группы'
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
								name='fullName'
								label='ФИО студента'
								rules={[{ required: true }]}
							>
								<Input placeholder='Иванов Иван Иванович' />
							</Form.Item>
							<Button type='primary' htmlType='submit' block ghost>
								Зачислить
							</Button>
						</Form>
					</Card>
				</Col>
			</Row>

			<Divider />

			<Title level={3}>Список студентов</Title>
			<Table
				dataSource={students}
				columns={columns}
				rowKey='id'
				pagination={{ pageSize: 5 }}
			/>
		</div>
	)
}
