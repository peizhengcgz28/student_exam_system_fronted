import { useEffect, useState, useMemo } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, Popconfirm, DatePicker, Tag, Empty, Radio, Checkbox } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FolderAddOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import request from '@/utils/request'
import type { Exam, Question } from '@/types'
import type { ColumnsType } from 'antd/es/table'

// 状态配置
const STATUS_CONFIG = {
  draft: { label: '草稿', color: 'default' },
  not_started: { label: '未开始', color: 'blue' },
  in_progress: { label: '进行中', color: 'green' },
  ended: { label: '已结束', color: 'gray' },
}

// 题型配置
const TYPE_MAP: Record<string, string> = {
  single: '单选题',
  multiple: '多选题',
  judge: '判断题',
  essay: '简答题',
}

// 计算试卷状态
const calculateStatus = (exam: Exam): 'draft' | 'not_started' | 'in_progress' | 'ended' => {
  if (!exam.startTime || !exam.endTime) return 'draft'
  if (exam.questions?.length === 0) return 'draft'

  const now = dayjs()
  const start = dayjs(exam.startTime)
  const end = dayjs(exam.endTime)

  if (now.isBefore(start)) return 'not_started'
  if (now.isAfter(end)) return 'ended'
  return 'in_progress'
}

export default function ExamManage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [examModalVisible, setExamModalVisible] = useState(false)
  const [questionModalVisible, setQuestionModalVisible] = useState(false)
  const [previewModalVisible, setPreviewModalVisible] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [currentExam, setCurrentExam] = useState<Exam | null>(null)
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([])
  const [previewExam, setPreviewExam] = useState<Exam | null>(null)
  const [form] = Form.useForm()
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchExams()
    fetchQuestions()
  }, [])

  const fetchExams = async () => {
    setLoading(true)
    try {
      const res = await request.get('/teacher/exams')
      setExams(res.data || [])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestions = async () => {
    try {
      const res = await request.get('/teacher/questions')
      setAllQuestions(res.data || [])
    } catch (error) {
    }
  }

  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const status = calculateStatus(exam)
      const matchSearch = exam.title.toLowerCase().includes(searchText.toLowerCase())
      const matchStatus = statusFilter === 'all' || status === statusFilter
      return matchSearch && matchStatus
    })
  }, [exams, searchText, statusFilter])

  const handleOpenCreate = () => {
    setEditingExam(null)
    form.resetFields()
    setExamModalVisible(true)
  }

  const handleOpenEdit = (exam: Exam) => {
    setEditingExam(exam)
    form.setFieldsValue({
      title: exam.title,
      description: exam.description || '',
      duration: exam.duration,
      startTime: exam.startTime ? dayjs(exam.startTime) : null,
      endTime: exam.endTime ? dayjs(exam.endTime) : null,
    })
    setExamModalVisible(true)
  }

  const handleSaveExam = async () => {
    try {
      const values = await form.validateFields()
      const submitValues = {
        ...values,
        startTime: values.startTime ? dayjs(values.startTime).format('YYYY-MM-DD HH:mm:ss') : '',
        endTime: values.endTime ? dayjs(values.endTime).format('YYYY-MM-DD HH:mm:ss') : '',
      }
      if (editingExam) {
        await request.put(`/teacher/exams/${editingExam.id}`, submitValues)
      } else {
        await request.post('/teacher/exams', submitValues)
      }
      setExamModalVisible(false)
      form.resetFields()
      setEditingExam(null)
      fetchExams()
    } catch (error) {
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await request.delete(`/teacher/exams/${id}`)
      fetchExams()
    } catch (error) {
    }
  }

  const handleOpenQuestionModal = (exam: Exam) => {
    setCurrentExam(exam)
    setSelectedQuestionIds(exam.questions?.map(q => q.id) || [])
    setQuestionModalVisible(true)
  }

  const handleSaveQuestions = async () => {
    if (!currentExam || selectedQuestionIds.length === 0) {
      Modal.warning({ title: '提示', content: '请至少选择一道题目' })
      return
    }
    try {
      await request.put(`/teacher/exams/${currentExam.id}`, { questionIds: selectedQuestionIds })
      setQuestionModalVisible(false)
      fetchExams()
    } catch (error) {
    }
  }

  const handleOpenPreview = (exam: Exam) => {
    setPreviewExam(exam)
    setPreviewModalVisible(true)
  }

  const getButtonDisabled = (exam: Exam, action: 'manage' | 'preview' | 'edit' | 'delete') => {
    const status = calculateStatus(exam)
    switch (action) {
      case 'manage': return status === 'in_progress' || status === 'ended'
      case 'preview': return exam.questions?.length === 0 && status === 'draft'
      case 'edit': return status === 'in_progress' || status === 'ended'
      case 'delete': return false
      default: return false
    }
  }

  const getButtonTip = (exam: Exam, action: 'manage' | 'preview' | 'edit' | 'delete') => {
    const status = calculateStatus(exam)
    switch (action) {
      case 'manage': return status === 'in_progress' ? '考试进行中，不可修改试题' : status === 'ended' ? '考试已结束' : ''
      case 'preview': return exam.questions?.length === 0 ? '请先添加题目' : ''
      case 'edit': return status === 'in_progress' ? '考试进行中，不可编辑' : status === 'ended' ? '考试已结束' : ''
      default: return ''
    }
  }

  const columns: ColumnsType<Exam> = [
    {
      title: '试卷名称',
      dataIndex: 'title',
      key: 'title',
      width: 260,
      ellipsis: true,
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const status = calculateStatus(record)
        const config = STATUS_CONFIG[status]
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '试卷信息',
      key: 'info',
      width: 160,
      align: 'center',
      // 写死：固定120分钟、100分、共4题
      render: () => (
        <div style={{ fontSize: 13, lineHeight: 1.5 }}>
          <div>120 分钟</div>
          <div>100分 / 4 题</div>
        </div>
      ),
    },
    {
      title: '考试时间',
      key: 'examTime',
      width: 200,
      align: 'center',
      render: (_, record) => {
        const start = record.startTime ? dayjs(record.startTime).format('MM-DD HH:mm') : '-'
        const end = record.endTime ? dayjs(record.endTime).format('MM-DD HH:mm') : '-'
        return (
          <div style={{ fontSize: 13, lineHeight: 1.4 }}>
            <div>开始：{start}</div>
            <div>结束：{end}</div>
          </div>
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link" size="small" icon={<FolderAddOutlined />}
            onClick={() => handleOpenQuestionModal(record)}
            disabled={getButtonDisabled(record, 'manage')}
            title={getButtonTip(record, 'manage')}
          >管理题目</Button>
          <Button
            type="link" size="small" icon={<EyeOutlined />}
            onClick={() => handleOpenPreview(record)}
            disabled={getButtonDisabled(record, 'preview')}
            title={getButtonTip(record, 'preview')}
          >预览</Button>
          <Button
            type="link" size="small" icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
            disabled={getButtonDisabled(record, 'edit')}
            title={getButtonTip(record, 'edit')}
          >编辑</Button>
          <Popconfirm title="确定删除该试卷吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = { single: 'blue', multiple: 'green', judge: 'orange', essay: 'purple' }
    return colorMap[type] || 'default'
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>试卷管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>新建试卷</Button>
        </div>

        <Space size={12}>
          <Input
            placeholder="输入试卷名称搜索"
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 140, height: 32, borderRadius: 6, border: '1px solid #d9d9d9', paddingLeft: 12, cursor: 'pointer' }}
          >
            <option value="all">全部状态</option>
            <option value="draft">草稿</option>
            <option value="not_started">未开始</option>
            <option value="in_progress">进行中</option>
            <option value="ended">已结束</option>
          </select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredExams}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        locale={{
          emptyText: (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={
              searchText || statusFilter !== 'all' ? '未查询到匹配的试卷' :
                <>
                  <span>暂无试卷数据</span><br />
                  <Button type="link" onClick={handleOpenCreate} style={{ marginTop: 8 }}>立即新建试卷</Button>
                </>
            } />
          ),
        }}
        scroll={{ x: 900 }}
      />

      <Modal
        title={editingExam ? '编辑试卷' : '新建试卷'}
        open={examModalVisible}
        onCancel={() => { setExamModalVisible(false); setEditingExam(null); form.resetFields() }}
        footer={[
          <Button key="cancel" onClick={() => setExamModalVisible(false)}>取消</Button>,
          <Button key="save" type="primary" onClick={handleSaveExam}>保存</Button>,
        ]}
        width={620}
      >
        <Form form={form} layout="vertical">
          <div style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>基础信息</div>
          <Form.Item name="title" label="试卷标题" rules={[{ required: true, message: '请输入试卷标题' }]}>
            <Input placeholder="请输入试卷标题（1~50字）" maxLength={50} />
          </Form.Item>
          <Form.Item name="description" label="试卷描述">
            <Input.TextArea rows={2} placeholder="请输入试卷描述（选填）" />
          </Form.Item>

          <div style={{ marginBottom: 16, marginTop: 24, color: '#666', fontSize: 14 }}>考试设置</div>
          <Form.Item name="duration" label="考试时长(分钟)" rules={[{ required: true, message: '请输入考试时长' }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入考试时长" />
          </Form.Item>
          <Form.Item name="startTime" label="开始时间" rules={[{ required: true, message: '请选择开始时间' }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} placeholder="请选择开始时间" />
          </Form.Item>
          <Form.Item name="endTime" label="结束时间" rules={[{ required: true, message: '请选择结束时间' }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} placeholder="请选择结束时间" />
          </Form.Item>

          <div style={{ marginTop: 16, color: '#999', fontSize: 12 }}>
            提示：结束时间必须晚于开始时间；试卷固定4道题目，总分100分
          </div>
        </Form>
      </Modal>

      <Modal
        title={`管理题目 - ${currentExam?.title}`}
        open={questionModalVisible}
        onCancel={() => { setQuestionModalVisible(false); setCurrentExam(null); setSelectedQuestionIds([]) }}
        footer={[
          <Button key="cancel" onClick={() => setQuestionModalVisible(false)}>取消</Button>,
          <Button key="save" type="primary" onClick={handleSaveQuestions}>保存</Button>,
        ]}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <span>当前已选：<Tag color="blue">{selectedQuestionIds.length}</Tag> 题</span>
          {/* 写死总分100分 */}
          <span style={{ marginLeft: 16 }}>
            试卷总分：<Tag color="green">100 分</Tag>
          </span>
        </div>

        {allQuestions.length === 0 ? (
          <Empty description="暂无题库题目，请前往题库管理新增题目" />
        ) : (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {allQuestions.map(q => (
              <div
                key={q.id}
                style={{
                  display: 'flex', alignItems: 'center', padding: '8px 12px', marginBottom: 8, borderRadius: 6,
                  border: selectedQuestionIds.includes(q.id) ? '1px solid #1890ff' : '1px solid #f0f0f0',
                  background: selectedQuestionIds.includes(q.id) ? '#e6f7ff' : '#fff', cursor: 'pointer',
                }}
                onClick={() => {
                  if (selectedQuestionIds.includes(q.id)) setSelectedQuestionIds(selectedQuestionIds.filter(id => id !== q.id))
                  else setSelectedQuestionIds([...selectedQuestionIds, q.id])
                }}
              >
                <input type="checkbox" checked={selectedQuestionIds.includes(q.id)} onChange={() => {}} style={{ marginRight: 12 }} />
                <Tag color={getTypeColor(q.type)} style={{ marginRight: 8 }}>{TYPE_MAP[q.type]}</Tag>
                <Tag style={{ marginRight: 8 }}>{q.score}分</Tag>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.content}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 16, color: '#999', fontSize: 12 }}>提示：至少选择一道题目才可保存，试卷固定4题、总分100分</div>
      </Modal>

      <Modal
        title={`预览试卷 - ${previewExam?.title}`}
        open={previewModalVisible}
        onCancel={() => { setPreviewModalVisible(false); setPreviewExam(null) }}
        footer={[<Button key="close" onClick={() => setPreviewModalVisible(false)}>关闭</Button>]}
        width={700}
      >
        {previewExam && (
          <div>
            <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
              <p style={{ margin: '0 0 8px 0' }}><strong>试卷说明：</strong>{previewExam.description || '无'}</p>
              {/* 预览页也写死总分和时长 */}
              <p style={{ margin: 0 }}><strong>总分：</strong>100 分 &nbsp; <strong>时长：</strong>{previewExam.duration} 分钟</p>
            </div>

            {previewExam.questions?.length === 0 ? (
              <Empty description="该试卷暂无题目" />
            ) : (
              <div>
                {previewExam.questions?.map((q, index) => (
                  <div key={q.id} style={{ marginBottom: 20, padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}>
                    <p style={{ margin: '0 0 12px 0', fontWeight: 500 }}>
                      {index + 1}. {q.content} <span style={{ color: '#999', fontWeight: 400 }}>（{q.score}分）</span>
                    </p>

                    {q.type === 'single' && q.options && (
                      <Radio.Group style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {q.options.map((opt, i) => <Radio key={i} value={i}>{String.fromCharCode(65 + i)}. {opt}</Radio>)}
                      </Radio.Group>
                    )}

                    {q.type === 'multiple' && q.options && (
                      <Checkbox.Group style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {q.options.map((opt, i) => <Checkbox key={i} value={i}>{String.fromCharCode(65 + i)}. {opt}</Checkbox>)}
                      </Checkbox.Group>
                    )}

                    {q.type === 'judge' && <Radio.Group><Radio value="true">正确</Radio><Radio value="false">错误</Radio></Radio.Group>}
                    {q.type === 'essay' && <Input.TextArea rows={3} placeholder="请输入答案" disabled />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}