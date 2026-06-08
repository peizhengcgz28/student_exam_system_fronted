import { useEffect, useState } from 'react'
import { Table, Card, Select, Space, Button, message } from 'antd'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'

const { Option } = Select

// 模拟数据
const mockStudents = [
  {
    id: '1',
    studentName: 'student_wang',
    className: '一班',
    examTitle: '前端开发基础测试',
    score: 95,
    submitTime: '2025-06-08 08:52:24'
  },
  {
    id: '2',
    studentName: 'student_chen',
    className: '二班',
    examTitle: '前端开发基础测试',
    score: 75,
    submitTime: '2025-06-08 09:10:15'
  }
]

export default function ScoreManage() {
  const [scores, setScores] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('all')

  useEffect(() => {
    setScores(mockStudents)
  }, [])

  // 班级筛选
  const filteredScores = selectedClass === 'all'
    ? scores
    : scores.filter(s => s.className === selectedClass)

  // 导出 CSV
  const exportScores = () => {
    if (filteredScores.length === 0) {
      message.warning('暂无成绩可导出')
      return
    }

    const csvRows = [
      ['学生姓名', '班级', '试卷名称', '得分', '满分', '提交时间'],
      ...filteredScores.map(s => [
        s.studentName,
        s.className,
        s.examTitle,
        s.score,
        100,
        s.submitTime
      ]),
    ]

    const csvContent = csvRows.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `成绩导出_${new Date().getTime()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    message.success('导出成功')
  }

  // 表格列
  const columns = [
    { title: '学生姓名', dataIndex: 'studentName', key: 'studentName' },
    { title: '班级', dataIndex: 'className', key: 'className' },
    { title: '试卷名称', dataIndex: 'examTitle', key: 'examTitle' },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => (
        <strong style={{ color: score >= 60 ? '#3f8600' : '#cf1322' }}>
          {score} / 100 分
        </strong>
      )
    },
    { title: '提交时间', dataIndex: 'submitTime', key: 'submitTime' },
  ]

  // 图表数据
  const chartData = filteredScores.map(s => ({
    name: s.studentName,
    得分: s.score
  }))

  return (
    <div style={{ padding: 24 }}>
      <Card title="成绩统计图表" style={{ marginBottom: 24 }}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="得分" fill="#1890ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="成绩列表">
        <Space style={{ marginBottom: 16 }}>
          <Select
            value={selectedClass}
            onChange={setSelectedClass}
            style={{ width: 200 }}
          >
            <Option value="all">全部班级</Option>
            <Option value="一班">一班</Option>
            <Option value="二班">二班</Option>
          </Select>
          <Button type="primary" onClick={exportScores}>导出CSV</Button>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredScores}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}