import { useEffect, useState } from 'react'
import { Table, Button, Card, Space, Modal, Form, Input, Select, InputNumber } from 'antd'
import request from '@/utils/request'
import type { Question } from '@/types'

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const res = await request.get('/teacher/questions')
      setQuestions(res.data)
    } catch (error) {
      // 静默处理错误
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这道题目吗？',
      onOk: async () => {
        await request.delete(`/teacher/questions/${id}`)
        fetchQuestions()
      },
    })
  }

  const handleSubmit = async (values: any) => {
    try {
      await request.post('/teacher/questions', values)
      setModalVisible(false)
      form.resetFields()
      fetchQuestions()
    } catch (error) {
      // 静默处理错误
    }
  }

  const columns = [
    { title: '题目内容', dataIndex: 'content', key: 'content', width: 400 },
    { title: '题型', dataIndex: 'type', key: 'type' },
    { title: '分值', dataIndex: 'score', key: 'score' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Question) => (
        <Space>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title="题库管理"
      bordered={false}
      extra={
        <Button type="primary" onClick={() => setModalVisible(true)}>
          添加题目
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={questions}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title="添加题目"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="content" label="题目内容" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="type" label="题型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="single">单选题</Select.Option>
              <Select.Option value="multiple">多选题</Select.Option>
              <Select.Option value="judge">判断题</Select.Option>
              <Select.Option value="essay">简答题</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="score" label="分值" rules={[{ required: true }]}>
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="options" label="选项（JSON数组，仅选择题需要）">
            <Input placeholder='["选项A", "选项B", "选项C", "选项D"]' />
          </Form.Item>
          <Form.Item name="answer" label="答案" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
