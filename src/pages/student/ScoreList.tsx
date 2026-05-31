import { useEffect, useState } from 'react'
import { Table, Card } from 'antd'
import request from '@/utils/request'
import type { Score } from '@/types'

export default function ScoreList() {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchScores()
  }, [])

  const fetchScores = async () => {
    setLoading(true)
    try {
      const res = await request.get('/student/scores')
      setScores(res.data)
    } catch (error) {
      // 静默处理错误
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: '试卷名称', dataIndex: 'examTitle', key: 'examTitle' },
    { title: '得分', dataIndex: 'score', key: 'score', render: (score: number) => <strong>{score}</strong> },
    { title: '提交时间', dataIndex: 'submitTime', key: 'submitTime' },
  ]

  return (
    <Card title="我的成绩" bordered={false}>
      <Table
        columns={columns}
        dataSource={scores}
        rowKey="examId"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  )
}