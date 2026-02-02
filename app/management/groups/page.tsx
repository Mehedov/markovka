"use client";

import {
  useAddGroupMutation,
  useDeleteGroupMutation,
  useGetGroupsQuery,
} from "@/services/group/groupApi";
import { DeleteOutlined, TeamOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Popconfirm,
  Row,
  Space,
  Table,
  Typography,
} from "antd";

const { Title, Text } = Typography;

export default function GroupsManagement() {
  const [form] = Form.useForm();

  const { data: groups = [] } = useGetGroupsQuery();

  const [addGroup] = useAddGroupMutation();
  const [deleteGroup] = useDeleteGroupMutation();

  const onFinish = async (values: { name: string }) => {
    await addGroup(values).unwrap();
    form.resetFields();
    message.success("Группа создана");
  };

  const groupColumns = [
    { title: "Название группы", dataIndex: "name", key: "name" },
    {
      title: "Действие",
      render: (_: unknown, record: { id: string }) => (
        <Popconfirm
          title="Удалить группу?"
          onConfirm={() => deleteGroup(record.id)}
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Управление группами</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TeamOutlined /> Создать новую группу
              </Space>
            }
          >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="name"
                label="Название группы"
                rules={[{ required: true, message: "Введите название группы" }]}
              >
                <Input placeholder="Напр: ИТ-24" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block>
                Создать группу
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Список групп">
            <div>
              <Table
                dataSource={groups}
                columns={groupColumns}
                rowKey="id"
                pagination={{ pageSize: 7 }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
