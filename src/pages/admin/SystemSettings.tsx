import { Card, Form, Input, InputNumber, Switch, Button, Spin, Empty, message } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'

interface SystemSettings {
  systemName: string
  examAutoSubmit: boolean
  maxExamAttempts: number
  minPasswordLength: number
}

const STORAGE_KEY = 'student_exam_system_settings'

export default function SystemSettings() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY)
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings) as SystemSettings
        form.setFieldsValue(parsed)
        setHasData(true)
      } catch (e) {
        console.error('读取本地设置失败:', e)
        setHasData(false)
      }
    }
    setLoading(false)
  }, [form])

  const initDefaultSettings = () => {
    const defaultSettings: SystemSettings = {
      systemName: '学生考试系统',
      examAutoSubmit: true,
      maxExamAttempts: 3,
      minPasswordLength: 8
    }
    form.setFieldsValue(defaultSettings)
    setHasData(true)
    message.success('已初始化默认设置')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const values = await form.validateFields()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values))
      message.success('设置保存成功')
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败，请检查表单填写是否正确')
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
          <Empty description="暂无系统设置数据" />
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Button type="primary" onClick={initDefaultSettings}>
              初始化默认设置
            </Button>
          </div>
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
        <Card title="基本设置" style={{ marginBottom: 16 }}>
          <Form.Item
            label="系统名称"
            name="systemName"
            rules={[{ required: true, message: '请输入系统名称' }]}
          >
            <Input placeholder="请输入系统名称" />
          </Form.Item>
        </Card>

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
              { type: 'number', min: 1, message: '最小值为 1' }
            ]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              addonAfter="次" 
              min={1} 
              placeholder="例如：3" 
            />
          </Form.Item>
        </Card>

        <Card title="安全设置">
          <Form.Item
            label="密码最小长度"
            name="minPasswordLength"
            help="建议8-20位，用户密码需包含大小写字母+数字"
            rules={[
              { required: true, message: '请输入密码最小长度' },
              { type: 'number', min: 6, max: 20, message: '长度必须在 6-20 之间' }
            ]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              addonAfter="位" 
              min={6} 
              max={20} 
              placeholder="例如：8" 
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 16 }}>
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