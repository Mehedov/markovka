'use client';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const onFinish = async (values: any) => {
    const { error } = await supabase.auth.signUp({
      email: values.email, // Используем email вместо username
      password: values.password,
    });

    if (error) {
      message.error('Ошибка входа: ' + error.message);
    } else {
      message.success('Вы вошли!');
      router.push('/management');
      router.refresh();
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Card title="Вход для администратора" style={{ width: 400 }}>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="test@example.com" />
          </Form.Item>
          <Form.Item name="password" label="Пароль" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Войти</Button>
        </Form>
      </Card>
    </div>
  );
}