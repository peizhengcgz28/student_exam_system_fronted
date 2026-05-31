import { Form, Input, Button, Card, Select } from 'antd'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '@/services/auth'
import { useState } from 'react'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

const onFinish = async (values: any) => {
  setLoading(true)
  try {
    // 构造符合后端 API 要求的参数
    const sendParams = {
      name: values.username,  // 表单字段是 username,但后端需要 name
      phone: values.phone,
      password: values.password,
      role: values.role
    } as { name: string; phone: string; password: string; role: string }
    
    await authAPI.register(sendParams)
    navigate('/login')
  } catch (error) {
    console.error('Register failed:', error)
  } finally {
    setLoading(false)
  }
}

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title="用户注册" style={{ width: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Form onFinish={onFinish} layout="vertical">

          {/* 用户名 */}
          <Form.Item 
            label="用户名"
            name="username" 
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" size="large" />
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
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password placeholder="请设置密码（至少6位）" size="large" />
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
          
          {/* 身份 */}
          <Form.Item 
            label="注册身份"
            name="role" 
            initialValue="student"
            rules={[{ required: true, message: '请选择注册身份' }]}
          >
            <Select 
              size="large"
              placeholder="请选择身份"
              options={[
                { value: 'student', label: '学生' },
                { value: 'teacher', label: '教师' },
                { value: 'teacher', label: '管理员' },
              ]} 
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              注册
            </Button>
          </Form.Item>
          
          <Button type="link" onClick={() => navigate('/login')} block>
            已有账号？去登录
          </Button>
        </Form>
      </Card>
    </div>
  )
}