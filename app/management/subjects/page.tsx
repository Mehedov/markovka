'use client'

import { useGetGroupsQuery } from '@/services/group/groupApi'
import {
	useAddSubjectMutation,
	useDeleteSubjectMutation,
	useGetSubjectsQuery,
} from '@/services/subjects/subjectsApi'
import { Group } from '@/types/attendance'
import { BookOutlined, DeleteOutlined } from '@ant-design/icons'
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

const { Title } = Typography

export default function SubjectsManagement() {
	const [form] = Form.useForm()

	const { data: subjects = [] } = useGetSubjectsQuery()
	const { data: groups = [] } = useGetGroupsQuery()

	const [addSubject] = useAddSubjectMutation()
	const [deleteSubject] = useDeleteSubjectMutation()

	const onFinish = async (values: { name: string; group_id: string }) => {
		await addSubject(values).unwrap()
		form.resetFields(['name', 'group_id'])
		message.success('Дисциплина добавлена')
	}

	const subjectColumns = [
		{ title: 'Дисциплина', dataIndex: 'name', key: 'name' },
		{
			title: 'Для группы',
			dataIndex: 'group_id',
			render: (id: string) =>
				groups.find((g: Group) => g.id === id)?.name || '—',
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
			<Title level={2}>Управление предметами</Title>

			<Row gutter={[24, 24]}>
				<Col xs={24} lg={12}>
					<Card
						title={
							<Space>
								<BookOutlined /> Добавить новую дисциплину
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
								name='name'
								label='Название дисциплины'
								rules={[
									{ required: true, message: 'Введите название дисциплины' },
								]}
							>
								<Input placeholder='Напр: Высшая математика' />
							</Form.Item>

							<Button type='primary' htmlType='submit' block>
								Добавить дисциплину
							</Button>
						</Form>
					</Card>
				</Col>

				<Col xs={24} lg={12}>
					<Card title='Список дисциплин'>
						<div style={{ maxHeight: 400, overflowY: 'auto' }}>
							<Table
								dataSource={subjects}
								columns={subjectColumns}
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
