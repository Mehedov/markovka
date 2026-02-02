"use client";

import { useGetGroupsQuery } from "@/services/group/groupApi";
import { useGetSubjectsQuery } from "@/services/subjects/subjectsApi";
import {
  useAssignSubjectToTeacherMutation,
  useGetProfilesQuery,
  useGetTeacherRelationsQuery,
  useRemoveTeacherRelationMutation,
} from "@/services/teacher/teacherApi";
import { Group } from "@/types/attendance";
import { DeleteOutlined, LinkOutlined, UserOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  List,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Typography,
} from "antd";

const { Title } = Typography;

export default function TeachersManagement() {
  const [form] = Form.useForm();

  const { data: profiles = [] } = useGetProfilesQuery();
  const { data: subjects = [] } = useGetSubjectsQuery();
  const { data: groups = [] } = useGetGroupsQuery();
  const { data: relations = [] } = useGetTeacherRelationsQuery();

  // Типизация для предметов
  interface Subject {
    id: string;
    name: string;
    group_id: string;
  }

  // Типизация для связей преподавателей
  interface TeacherRelation {
    id: string;
    teacher_id: string;
    subject_id: string;
  }

  // Типизация для профилей
  interface Profile {
    id: string;
    email: string;
    full_name?: string;
  }

  const [assignSubject] = useAssignSubjectToTeacherMutation();
  const [removeRelation] = useRemoveTeacherRelationMutation();

  const onFinish = async (values: {
    teacher_id: string;
    subject_id: string;
  }) => {
    try {
      await assignSubject(values).unwrap();
      message.success("Предмет закреплен за преподавателем");
      form.resetFields(["teacher_id", "subject_id"]);
    } catch (e) {
      message.error("Ошибка: возможно связь уже существует");
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Управление преподавателями</Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <LinkOutlined /> Назначить предмет преподавателю
              </Space>
            }
          >
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="teacher_id"
                label="Выберите преподавателя"
                rules={[{ required: true, message: "Выберите преподавателя" }]}
              >
                <Select placeholder="Email преподавателя">
                  {profiles.map((p) => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.email}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="subject_id"
                label="Выберите предмет"
                rules={[{ required: true, message: "Выберите предмет" }]}
              >
                <Select placeholder="Предмет (Группа)">
                  {subjects.map((s: Subject) => (
                    <Select.Option key={s.id} value={s.id}>
                      {s.name} (
                      {groups.find((g: Group) => g.id === s.group_id)?.name})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Button type="primary" htmlType="submit" block>
                Закрепить предмет
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Текущие назначения"
            styles={{ body: { maxHeight: "60vh", overflowY: "auto" } }}
          >
            <List
              dataSource={relations}
              renderItem={(rel: TeacherRelation) => {
                const teacher = profiles.find(
                  (p: Profile) => p.id === rel.teacher_id,
                );
                const subject = subjects.find(
                  (s: Subject) => s.id === rel.subject_id,
                );
                return (
                  <List.Item
                    actions={[
                      <Popconfirm
                        key={rel.id}
                        title="Отвязать предмет от преподавателя?"
                        onConfirm={() => removeRelation(rel.id)}
                      >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<UserOutlined />}
                      title={teacher?.full_name || teacher?.email}
                      description={`${subject?.name} — ${groups.find((g: Group) => g.id === subject?.group_id)?.name}`}
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
