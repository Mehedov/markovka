"use client";

import { supabase } from "@/lib/supabase";
import { useGetAttendanceQuery } from "@/services/attendance/attendanceApi";
import { useGetStudentsQuery } from "@/services/students/studentsApi";
import { useGetSubjectsQuery } from "@/services/subjects/subjectsApi";
import {
  useGetProfilesQuery,
  useGetTeacherRelationsQuery,
} from "@/services/teacher/teacherApi";
import {
  BookOutlined,
  FileExcelOutlined,
  RiseOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { User } from "@supabase/supabase-js";
import {
  Avatar,
  Button,
  Card,
  theme,
  Col,
  DatePicker,
  Divider,
  Empty,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

dayjs.locale("ru");
const { Title, Text } = Typography;

export default function ProfilePage() {
  const { token } = theme.useToken();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(dayjs());

  const { data: profiles = [] } = useGetProfilesQuery();
  const { data: relations = [] } = useGetTeacherRelationsQuery();
  const { data: subjects = [] } = useGetSubjectsQuery();
  const { data: attendance = [] } = useGetAttendanceQuery();
  const { data: allStudents = [] } = useGetStudentsQuery();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
  }, []);

  const myProfile = profiles.find((p) => p.id === currentUser?.id);

  // --- ЛОГИКА АНАЛИТИКИ ---
  const analytics = useMemo(() => {
    if (!currentUser || !relations.length) return null;

    const mySubjectIds = relations
      .filter((r) => r.teacher_id === currentUser.id)
      .map((r) => r.subject_id);

    const filteredAttendance = attendance.filter((a) => {
      const isMySubject = mySubjectIds.includes(a.subject_id);
      const isSameMonth = dayjs(a.date).isSame(selectedMonth, "month");
      return isMySubject && isSameMonth;
    });

    // Сбор статистики по предметам
    const subjectsStats = subjects
      .filter((s) => mySubjectIds.includes(s.id))
      .map((sub) => {
        const records = filteredAttendance.filter(
          (a) => a.subject_id === sub.id,
        );
        const presents = records.filter((a) => a.status === "present").length;
        const total = records.filter((a) => a.status !== "none").length;
        return {
          ...sub,
          percent: total > 0 ? Math.round((presents / total) * 100) : 0,
          totalRecords: total,
        };
      });

    // Поиск прогульщиков (3+ пропуска)
    const studentAbsences: Record<
      string,
      { id: string; name: string; count: number }
    > = {};
    filteredAttendance.forEach((record) => {
      if (record.status === "absent") {
        const student = allStudents.find((s) => s.id === record.student_id);
        if (student) {
          if (!studentAbsences[student.id]) {
            studentAbsences[student.id] = {
              id: student.id,
              name: student.full_name,
              count: 0,
            };
          }
          studentAbsences[student.id].count++;
        }
      }
    });

    const topAbsentees = Object.values(studentAbsences)
      .filter((s) => s.count >= 3)
      .sort((a, b) => b.count - a.count);

    const totalValid = filteredAttendance.filter(
      (a) => a.status !== "none",
    ).length;
    const totalPresents = filteredAttendance.filter(
      (a) => a.status === "present",
    ).length;

    return {
      subjectsStats,
      totalPercent:
        totalValid > 0 ? Math.round((totalPresents / totalValid) * 100) : 0,
      totalStudentsMarked: totalValid,
      topAbsentees,
      rawFilteredData: filteredAttendance, // Сохраняем для экспорта
    };
  }, [
    currentUser,
    relations,
    subjects,
    attendance,
    selectedMonth,
    allStudents,
  ]);

  // --- ФУНКЦИЯ ЭКСПОРТА В EXCEL ---
  const exportToExcel = () => {
    if (!analytics || analytics.topAbsentees.length === 0) return;

    // Формируем данные для таблицы
    const excelData = analytics.topAbsentees.map((s) => ({
      "ФИО Студента": s.name,
      "Кол-во пропусков": s.count,
      Месяц: selectedMonth.format("MMMM YYYY"),
      Статус: "В зоне риска",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Прогульщики");

    // Скачивание файла
    XLSX.writeFile(
      workbook,
      `Otchet_Progulshiki_${selectedMonth.format("MM_YYYY")}.xlsx`,
    );
  };

  if (!currentUser) return null;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
      <Row gutter={[24, 24]} align="middle" style={{ marginBottom: 32 }}>
        <Col xs={24} md={12}>
          <Title level={2} style={{ margin: 0 }}>
            Личный кабинет
          </Title>
        </Col>
        <Col xs={24} md={12} style={{ textAlign: "right" }}>
          <Space wrap>
            <DatePicker
              picker="month"
              value={selectedMonth}
              onChange={(date) => date && setSelectedMonth(date)}
              allowClear={false}
              format="MMMM YYYY"
            />
            <Button
              icon={<FileExcelOutlined />}
              onClick={exportToExcel}
              disabled={!analytics?.topAbsentees.length}
            >
              Выгрузить отчет
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* ПРОФИЛЬ */}
        <Col xs={24} lg={8}>
          <Card style={{ textAlign: "center" }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Avatar
                size={120}
                src={myProfile?.avatar_url}
                icon={<UserOutlined />}
                style={{ backgroundColor: token.colorPrimary }}
              />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  {myProfile?.full_name || "Загрузка..."}
                </Title>
                <Text type="secondary">{currentUser.email}</Text>
              </div>
              <Divider />
              <Statistic
                title={`Общая явка за ${selectedMonth.format("MMMM")}`}
                value={analytics?.totalPercent || 0}
                suffix="%"
                valueStyle={{
                  color:
                    (analytics?.totalPercent || 0) > 70 ? "#52c41a" : "#faad14",
                }}
              />
            </Space>
          </Card>
        </Col>

        {/* ПРЕДМЕТЫ */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <RiseOutlined /> Посещаемость по дисциплинам
              </Space>
            }
          >
            {analytics && analytics.subjectsStats.length > 0 ? (
              <List
                dataSource={analytics.subjectsStats}
                renderItem={(item) => (
                  <List.Item>
                    <div style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <Space>
                          <BookOutlined style={{ color: "#1890ff" }} />
                          <Text strong>{item.name}</Text>
                        </Space>
                        <Progress
                          percent={item.percent}
                          strokeColor={token.colorPrimary}
                          status="normal"
                        />
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Нет данных за этот период" />
            )}
          </Card>
        </Col>

        {/* ПРОГУЛЬЩИКИ */}
        <Col xs={24}>
          <Card
            title={
              <Space>
                <TeamOutlined style={{}} />
                <span style={{}}>
                  Студенты в зоне риска (3+ пропуска за месяц)
                </span>
              </Space>
            }
          >
            {analytics?.topAbsentees.length ? (
              <Row gutter={[16, 16]}>
                {analytics.topAbsentees.map((student) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={student.id}>
                    <Card
                      size="small"
                      style={{
                        border: `1px solid ${token.colorError}33`, // colorError с прозрачностью для границы
                        backgroundColor: `${token.colorError}1a`, // colorError с прозрачностью для фона
                      }}
                    >
                      <Space size="middle">
                        <Avatar icon={<UserOutlined />} />
                        {/* <Badge count={student.count} color={token.colorError}>
                        </Badge> */}
                        <div>
                          <Text strong>{student.name}</Text>
                          <br />
                          <Text
                            type="danger"
                            style={{
                              fontSize: "12px",
                              color: token.colorPrimary,
                            }}
                          >
                            {student.count} прогула(ов)
                          </Text>
                        </div>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="Все студенты посещали занятия исправно!" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
