import { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Space, message, InputNumber
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import request from '@/utils/request';

// 题型映射
const TYPE_MAP: Record<string, string> = {
  single: '单选题',
  multiple: '多选题',
  judge: '判断题',
  essay: '简答题',
};

// 默认分值：基于4道题总分100分合理分配
const DEFAULT_SCORE_MAP: Record<string, number> = {
  single: 25,
  multiple: 30,
  judge: 20,
  essay: 25,
};

interface Question {
  id: string;
  content: string;
  type: 'single' | 'multiple' | 'judge' | 'essay';
  score: number;
  options?: string[];
  answer: any;
  explanation?: string;
}

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [form] = Form.useForm()

  const [options, setOptions] = useState<string[]>(['', '', '', ''])

  // 监听题型变化：只要题型变，不管新增/编辑，都强制重置为默认分
  const watchType = Form.useWatch('type', form)
  useEffect(() => {
    if (watchType) {
      form.setFieldsValue({ score: DEFAULT_SCORE_MAP[watchType] })
    }
  }, [watchType, form])

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const res = await request.get('/teacher/questions')
      const questionsData: Question[] = res.data
      
      // 自动更新所有题目的分值为新标准
      const needsUpdate = questionsData.some((q: Question) => q.score !== DEFAULT_SCORE_MAP[q.type])
      
      if (needsUpdate && questionsData.length > 0) {
        message.info('正在同步题目分值到新标准...')
        
        // 批量更新所有需要更新的题目
        const updatePromises = questionsData
          .filter((q: Question) => q.score !== DEFAULT_SCORE_MAP[q.type])
          .map((q: Question) => 
            request.put(`/teacher/questions/${q.id}`, {
              type: q.type,
              content: q.content,
              score: DEFAULT_SCORE_MAP[q.type],
              options: q.options || [],
              answer: q.answer,
              explanation: q.explanation || '',
            })
          )
        
        if (updatePromises.length > 0) {
          await Promise.all(updatePromises)
          message.success(`已同步 ${updatePromises.length} 道题目的分值`)
          // 重新获取最新数据
          const updatedRes = await request.get('/teacher/questions')
          setQuestions(updatedRes.data)
        } else {
          setQuestions(questionsData)
        }
      } else {
        setQuestions(questionsData)
      }
    } catch (error) {
      message.error('加载题目失败')
    } finally {
      setLoading(false)
    }
  }

  // 新增
  const handleOpenModal = () => {
    setEditingQuestion(null)
    setOptions(['', '', '', ''])
    form.resetFields()
    setModalVisible(true)
  }

  // 编辑
  const handleEdit = (record: Question) => {
  setEditingQuestion(record)
  if (record.options && record.options.length > 0) {
    setOptions([...record.options])
  } else {
    setOptions(['', '', '', ''])
  }

  let displayAnswer = record.answer
  if (record.type === 'single' && record.options) {
    const index = parseInt(record.answer as string)
    if (!isNaN(index) && record.options[index]) {
      displayAnswer = String.fromCharCode(65 + index)
    }
  } else if (record.type === 'multiple' && record.options && Array.isArray(record.answer)) {
    displayAnswer = record.answer.map((idx: string) => {
      const index = parseInt(idx)
      return !isNaN(index) && record.options![index]
        ? String.fromCharCode(65 + index)
        : idx
    }).join(',')
  } else if (record.type === 'judge') {
    displayAnswer = record.answer === 'true' ? '正确' : '错误'
  }

  form.setFieldsValue({
    content: record.content,
    type: record.type,
    // 关键改动：打开编辑直接用预设分值覆盖旧数据
    score: DEFAULT_SCORE_MAP[record.type],
    answer: displayAnswer,
    explanation: record.explanation || '',
  })
  setModalVisible(true)
}

  const handleCloseModal = () => {
    setModalVisible(false)
    setEditingQuestion(null)
    setOptions(['', '', '', ''])
    form.resetFields()
  }

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这道题目吗？',
      okType: 'danger',
      onOk: async () => {
        try {
          await request.delete(`/teacher/questions/${id}`)
          message.success('删除成功')
          fetchQuestions()
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  const handleAddOption = () => setOptions([...options, ''])
  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      message.warning('至少保留2个选项')
      return
    }
    setOptions(options.filter((_, i) => i !== index))
  }
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields()
      await handleSubmit(values)
    } catch (error) { }
  }

  const handleSubmit = async (values: any) => {
    setSubmitLoading(true)
    try {
      const validOptions = options.filter(opt => opt.trim() !== '')

      let answer = values.answer
      if (values.type === 'single') {
        answer = answer?.toString().toUpperCase().trim()
      } else if (values.type === 'multiple') {
        const answers = answer?.toString().split(/[,，]/).map((a: string) => a.trim().toUpperCase())
        answer = answers?.join(',')
      } else if (values.type === 'judge') {
        answer = values.answer === '正确' ? 'true' : 'false'
      }

      const submitData = {
        type: values.type,
        content: values.content,
        score: values.score,
        options: validOptions,
        answer: answer,
        explanation: values.explanation || '',
      }

      if (editingQuestion) {
        await request.put(`/teacher/questions/${editingQuestion.id}`, submitData)
        message.success('修改成功')
      } else {
        await request.post('/teacher/questions', submitData)
        message.success('新增成功')
      }

      handleCloseModal()
      fetchQuestions()
    } catch (error: any) {
      console.error('保存失败:', error)
      message.error('保存失败，请稍后重试')
    } finally {
      setSubmitLoading(false)
    }
  }

  const columns = [
    { title: '题目内容', dataIndex: 'content', key: 'content', width: 400, ellipsis: true },
    { title: '题型', dataIndex: 'type', key: 'type', render: (type: string) => TYPE_MAP[type] || type },
    { title: '分值', dataIndex: 'score', key: 'score', width: 80 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Question) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title="题库管理"
      bordered={false}
      extra={
        <Button type="primary" onClick={handleOpenModal}>
          新增题目
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={questions}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (total: number) => `共 ${total} 条题目` }}
      />

      <Modal
        title={editingQuestion ? '编辑题目' : '新增题目'}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal}>取消</Button>,
          <Button key="submit" type="primary" loading={submitLoading} onClick={handleFormSubmit}>
            保存
          </Button>,
        ]}
        width={650}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="content"
            label="题目内容"
            rules={[{ required: true, message: '请输入题目内容' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入题目内容" />
          </Form.Item>

          <Form.Item
            name="type"
            label="题型"
            rules={[{ required: true, message: '请选择题型' }]}
          >
            <Select placeholder="请选择题型">
              <Select.Option value="single">单选题</Select.Option>
              <Select.Option value="multiple">多选题</Select.Option>
              <Select.Option value="judge">判断题</Select.Option>
              <Select.Option value="essay">简答题</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="score"
            label="分值"
            rules={[{ required: true, message: '请输入分值' }]}
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} placeholder="请输入分值（正整数）" />
          </Form.Item>

          {(watchType === 'single' || watchType === 'multiple') && (
            <Form.Item label="选项列表（至少2个选项）">
              {options.map((opt, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ width: 24, fontWeight: 'bold' }}>
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <Input
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`选项${String.fromCharCode(65 + index)}`}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveOption(index)}
                    disabled={options.length <= 2}
                  />
                </div>
              ))}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddOption}
                style={{ width: '100%' }}
              >
                添加选项
              </Button>
            </Form.Item>
          )}

          {watchType === 'single' && (
            <Form.Item
              name="answer"
              label="正确答案"
              rules={[{ required: true, message: '请输入正确答案' }]}
              extra="填写字母，如：A、B、C 或 D"
            >
              <Input placeholder="如：A" />
            </Form.Item>
          )}

          {watchType === 'multiple' && (
            <Form.Item
              name="answer"
              label="正确答案"
              rules={[{ required: true, message: '请输入正确答案' }]}
              extra="多个答案用英文逗号分隔，如：A,C"
            >
              <Input placeholder="如：A,C" />
            </Form.Item>
          )}

          {watchType === 'judge' && (
            <Form.Item
              name="answer"
              label="正确答案"
              rules={[{ required: true, message: '请选择正确答案' }]}
            >
              <Select placeholder="请选择正确答案">
                <Select.Option value="正确">正确</Select.Option>
                <Select.Option value="错误">错误</Select.Option>
              </Select>
            </Form.Item>
          )}

          {watchType === 'essay' && (
            <Form.Item
              name="answer"
              label="参考答案/评分要点"
            >
              <Input.TextArea rows={5} placeholder="请输入参考答案或评分要点" />
            </Form.Item>
          )}

          <Form.Item
            name="explanation"
            label="解析（可选）"
          >
            <Input.TextArea rows={3} placeholder="请输入题目解析（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}