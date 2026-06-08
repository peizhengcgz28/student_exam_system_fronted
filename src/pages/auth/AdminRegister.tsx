import { Form, Input, Button, Card } from 'antd'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '@/services/auth'
import { useState } from 'react'
import { message } from 'antd'

export default function AdminRegister() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      // 构造符合后端 API 要求的参数 - 固定为 admin 角色
      const sendParams = {
        name: values.username,
        phone: values.phone,
        password: values.password,
        role: 'admin'  // 强制设置为管理员
      } as { name: string; phone: string; password: string; role: string }
      
      await authAPI.register(sendParams)
      message.success('管理员账户注册成功！请登录')
      navigate('/login/admin')
    } catch (error: any) {
      console.error('Admin register failed:', error)
      message.error(error.response?.data?.detail || '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card 
        title="管理员注册" 
        style={{ width: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        extra={<span style={{ color: '#ff4d4f', fontSize: '12px' }}>️ 仅限系统管理员使用</span>}
      >
        <Form onFinish={onFinish} layout="vertical">

          {/* 用户名 */}
          <Form.Item 
            label="管理员用户名"
            name="username" 
            rules={[{ required: true, message: '请输入管理员用户名' }]}
          >
            <Input placeholder="请输入管理员用户名" size="large" />
          </Form.Item>

          {/* 手机号 */}
          <Form.Item 
            label="手机号"
            name="phone" 
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input placeholder="请输入手机号" size="large" />
          </Form.Item>
          
          {/* 密码 */}
          <Form.Item 
            label="密码"
            name="password" 
            rules={[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码至少8位' },
              { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '密码必须包含大小写字母和数字' }
            ]}
          >
            <Input.Password placeholder="请设置密码（至少8位，包含大小写字母和数字）" size="large" />
          </Form.Item>
          
          {/* 确认密码 */}
          <Form.Item 
            label="确认密码"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入密码" size="large" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              注册管理员账户
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a href="/login/admin">已有管理员账户？立即登录</a>
          </div>
        </Form>
      </Card>
    </div>
  )
}
