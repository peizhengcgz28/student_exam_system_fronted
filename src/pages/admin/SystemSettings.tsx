import { Card, Form, Input, Switch, Button, Divider, Spin, Empty, message } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import request from '@/utils/request'

interface SystemSettings {
  systemName: string
  allowRegister: boolean
  examAutoSubmit: boolean
  maxExamAttempts: number
  enableEmailNotification: boolean
  minPasswordLength: number
}

export default function SystemSettings() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      // TODO: 等后端实现系统设置接口后取消注释
      // const res = await request.get<SystemSettings>('/admin/settings')
      // form.setFieldsValue(res.data)
      // setHasData(true)
      
      // 暂时不设置任何初始值,等待后端接口实现
      setHasData(false)
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      setHasData(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const values = await form.validateFields()
      console.log('保存的设置:', values)
      
      // TODO: 调用后端 API 保存设置
      // await request.put('/admin/settings', values)
      
      message.success('设置保存成功')
      fetchSettings() // 重新获取最新设置
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!hasData) {
    return (
      <div>
        <h2 style={{ marginBottom: 24 }}>系统设置</h2>
        <Card>
          <Empty 
            description="暂无系统设置数据" 
            extra={
              <Button type="primary" onClick={() => setHasData(true)}>
                初始化默认设置
              </Button>
            }
          />
        </Card>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>系统设置</h2>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
      >
        {/* 基本设置 */}
        <Card title="基本设置" style={{ marginBottom: 16 }}>
          <Form.Item
            label="系统名称"
            name="systemName"
            rules={[{ required: true, message: '请输入系统名称' }]}
          >
            <Input placeholder="请输入系统名称" />
          </Form.Item>

          <Form.Item
            label="允许用户注册"
            name="allowRegister"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="启用邮件通知"
            name="enableEmailNotification"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Card>

        {/* 考试设置 */}
        <Card title="考试设置" style={{ marginBottom: 16 }}>
          <Form.Item
            label="考试自动提交"
            name="examAutoSubmit"
            valuePropName="checked"
            help="考试时间结束后自动提交试卷"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="最大考试次数"
            name="maxExamAttempts"
            rules={[
              { required: true, message: '请输入最大考试次数' },
              { type: 'number', min: 1, message: '最小值为1' }
            ]}
          >
            <Input type="number" placeholder="例如: 3" />
          </Form.Item>
        </Card>

        {/* 安全设置 */}
        <Card title="安全设置">
          <Form.Item
            label="密码最小长度"
            name="minPasswordLength"
            rules={[
              { required: true, message: '请输入密码最小长度' },
              { type: 'number', min: 6, max: 72, message: '密码长度必须在6-72之间' }
            ]}
          >
            <Input type="number" placeholder="例如: 6" />
          </Form.Item>

          <Divider />

          <Form.Item>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              htmlType="submit"
              loading={saving}
              size="large"
            >
              保存设置
            </Button>
          </Form.Item>
        </Card>
      </Form>
    </div>
  )
}
