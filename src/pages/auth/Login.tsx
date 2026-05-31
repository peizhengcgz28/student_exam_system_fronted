import { Form, Input, Button, Card, Select } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { authAPI } from '@/services/auth'
import { useState } from 'react'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [loading, setLoading] = useState(false)
  // 默认选中学生身份
  const [userRole, setUserRole] = useState<'student' | 'teacher' | 'admin'>('student')

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      const loginData = {
        username: values.username,
        password: values.password
      }
      
      console.log('发送登录数据:', loginData)
      
      // 调用真实 API
      const response = await authAPI.login(loginData)
      
      console.log('登录响应:', response)
      
      // 从响应中获取 token 和用户信息 (response 已经是 data,不需要再 .data)
      const { token, user } = response as any
      
      // 存储认证信息
      login(token, {
        ...user,
        role: userRole, // 使用用户选择的角色
      })
      
      // 根据角色跳转到不同页面
      const routeMap: Record<string, string> = {
        student: '/student/exams',
        teacher: '/teacher/questions',
        admin: '/admin/dashboard',
      }
      
      navigate(routeMap[userRole] || '/dashboard')
    } catch (error: any) {
      // 打印详细错误信息用于调试
      console.error('Login failed:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card 
        title="用户登录" 
        style={{ width: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      >
          <Form onFinish={onFinish} layout="vertical">
          {/* 用户名 */}
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" size="large" />
          </Form.Item>

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
          
          <Form.Item 
            label="密码"
            name="password" 
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password placeholder="请输入密码" size="large" />
          </Form.Item>
          
          {/* 角色选择下拉框 */}
          <Form.Item label="登录身份">
            <Select
              value={userRole}
              onChange={setUserRole}
              size="large"
              style={{ width: '100%' }}
              options={[
                { label: '学生', value: 'student' },
                { label: '教师', value: 'teacher' },
                { label: '管理员', value: 'admin' }
              ]}
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              登录
            </Button>
          </Form.Item>
          
          <Button type="link" onClick={() => navigate('/register')} block>
            还没有账号？立即注册
          </Button>
        </Form>
      </Card>
    </div>
  )
}