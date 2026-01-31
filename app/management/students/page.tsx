'use client'

import { useGetGroupsQuery } from '@/services/group/groupApi'
import {
	useAddStudentMutation,
	useDeleteStudentMutation,
	useGetStudentsQuery,
} from '@/services/students/studentsApi'
import { Group } from '@/types/attendance'
import { DeleteOutlined, UserAddOutlined } from '@ant-design/icons'
import {
	Button,
	Card,
	Col,
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

export default function StudentsManagement() {
	const [form] = Form.useForm()

	const { data: students = [] } = useGetStudentsQuery()
	const { data: groups = [] } = useGetGroupsQuery()

	const [addStudent] = useAddStudentMutation()
	const [deleteStudent] = useDeleteStudentMutation()

	const onFinish = async (values: { full_name: string; group_id: string }) => {
		await addStudent(values).unwrap()
		form.resetFields(['full_name', 'group_id'])
		message.success('Студент добавлен')
	}

	const studentColumns = [
		{ title: 'ФИО Студента', dataIndex: 'full_name', key: 'full_name' },
		{
			title: 'Группа',
			dataIndex: 'group_id',
			render: (id: string) =>
				groups.find((g: Group) => g.id === id)?.name || '—',
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

	return (
		<div style={{ padding: '24px' }}>
			<Title level={2}>Управление студентами</Title>

			<Row gutter={[24, 24]}>
				<Col xs={24} lg={12}>
					<Card
						title={
							<Space>
								<UserAddOutlined /> Зачислить нового студента
							</Space>
						}
					>
						<Form form={form} layout='vertical' onFinish={onFinish}>
							<Form.Item
								name='group_id'
								label='Группа'
								rules={[{ required: true, message: 'Выберите группу' }]}
							>
								<Select placeholder='Выберите группу'>
									{groups.map((g: Group) => (
										<Select.Option key={g.id} value={g.id}>
											{g.name}
										</Select.Option>
									))}
								</Select>
							</Form.Item>

							<Form.Item
								name='full_name'
								label='ФИО Студента'
								rules={[{ required: true, message: 'Введите ФИО студента' }]}
							>
								<Input placeholder='Иван Иванов' />
							</Form.Item>

							<Button type='primary' htmlType='submit' block>
								Зачислить студента
							</Button>
						</Form>
					</Card>
				</Col>

				<Col xs={24} lg={12}>
					<Card title='Список студентов'>
						<div style={{ maxHeight: 400, overflowY: 'auto' }}>
							<Table
								dataSource={students}
								columns={studentColumns}
								rowKey='id'
								pagination={{ pageSize: 10 }}
							/>
						</div>
					</Card>
				</Col>
			</Row>
		</div>
	)
}
