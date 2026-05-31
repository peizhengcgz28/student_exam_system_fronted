import { useEffect, useState } from 'react'
import { Table, Card, Select, Space, Button } from 'antd'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import request from '@/utils/request'
import type { Score } from '@/types'

const { Option } = Select

export default function ScoreManage() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedExam, setSelectedExam] = useState<string>('')
  const [exams, setExams] = useState<{ id: string; title: string }[]>([])

  useEffect(() => {
    fetchExams()
  }, [])

  useEffect(() => {
    if (selectedExam) {
      fetchScores(selectedExam)
    }
  }, [selectedExam])

  const fetchExams = async () => {
    try {
      const res = await request.get<{ id: string; title: string }[]>('/teacher/exams/simple')
      setExams(res.data)
      if (res.data.length > 0) setSelectedExam(res.data[0].id)
    } catch (error) {
      // 静默处理错误
    }
  }

  const fetchScores = async (examId: string) => {
    setLoading(true)
    try {
      const res = await request.get<Score[]>(`/teacher/scores?examId=${examId}`)
      setScores(res.data)
    } catch (error) {
      // 静默处理错误
    } finally {
      setLoading(false)
    }
  }

  const exportScores = () => {
    // 简单导出CSV
    const csvRows = [
      ['学生姓名', '试卷名称', '得分', '提交时间'],
      ...scores.map(s => [s.studentName, s.examTitle, s.score, s.submitTime]),
    ]
    const csvContent = csvRows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.setAttribute('download', 'scores.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const columns = [
    { title: '学生姓名', dataIndex: 'studentName', key: 'studentName' },
    { title: '试卷名称', dataIndex: 'examTitle', key: 'examTitle' },
    { title: '得分', dataIndex: 'score', key: 'score', render: (score: number) => <strong>{score}</strong> },
    { title: '提交时间', dataIndex: 'submitTime', key: 'submitTime' },
  ]

  // 图表数据
  const chartData = scores.map(s => ({ name: s.studentName, 得分: s.score }))

  return (
    <div>
      <Card title="成绩统计图表" style={{ marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="得分" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="成绩列表">
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="选择试卷"
            value={selectedExam}
            onChange={setSelectedExam}
            style={{ width: 200 }}
          >
            {exams.map(exam => (
              <Option key={exam.id} value={exam.id}>{exam.title}</Option>
            ))}
          </Select>
          <Button type="primary" onClick={exportScores}>导出CSV</Button>
        </Space>
        <Table
          columns={columns}
          dataSource={scores}
          rowKey="examId"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}
