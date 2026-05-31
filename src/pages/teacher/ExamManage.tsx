import { useEffect, useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, Popconfirm, DatePicker } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import request from '@/utils/request'
import type { Exam } from '@/types'

export default function ExamManage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    setLoading(true)
    try {
      const res = await request.get('/teacher/exams')
      setExams(res.data)
    } catch (error) {
      // 静默处理错误
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      // 将 dayjs 对象转换为字符串格式
      const submitValues = {
        ...values,
        startTime: values.startTime ? dayjs(values.startTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
        endTime: values.endTime ? dayjs(values.endTime).format('YYYY-MM-DD HH:mm:ss') : undefined,
      }
      if (editingExam) {
        await request.put(`/teacher/exams/${editingExam.id}`, submitValues)
      } else {
        await request.post('/teacher/exams', submitValues)
      }
      setModalVisible(false)
      form.resetFields()
      setEditingExam(null)
      fetchExams()
    } catch (error) {
      // 静默处理错误
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await request.delete(`/teacher/exams/${id}`)
      fetchExams()
    } catch (error) {
      // 静默处理错误
    }
  }

  const columns = [
    { title: '试卷标题', dataIndex: 'title', key: 'title' },
    { title: '考试时长(分钟)', dataIndex: 'duration', key: 'duration' },
    { title: '总分', dataIndex: 'totalScore', key: 'totalScore' },
    { title: '开始时间', dataIndex: 'startTime', key: 'startTime' },
    { title: '结束时间', dataIndex: 'endTime', key: 'endTime' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Exam) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => window.open(`/student/exam/${record.id}`, '_blank')}>预览</Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => {
            setEditingExam(record)
            // 将字符串时间转换为 dayjs 对象
            form.setFieldsValue({
              ...record,
              startTime: record.startTime ? dayjs(record.startTime) : undefined,
              endTime: record.endTime ? dayjs(record.endTime) : undefined,
            })
            setModalVisible(true)
          }}>编辑</Button>
          <Popconfirm title="确定删除该试卷吗？" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>创建试卷</Button>
      </div>
      <Table columns={columns} dataSource={exams} rowKey="id" loading={loading} />

      <Modal
        title={editingExam ? '编辑试卷' : '创建试卷'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false)
          setEditingExam(null)
          form.resetFields()
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="试卷标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="试卷描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="duration" label="考试时长（分钟）" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="startTime" label="开始时间" rules={[{ required: true }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} placeholder="请选择开始时间" />
          </Form.Item>
          <Form.Item name="endTime" label="结束时间" rules={[{ required: true }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} placeholder="请选择结束时间" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
