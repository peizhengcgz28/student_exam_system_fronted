import { useEffect, useState } from 'react'
import { Button, Card, List, Tag, Spin } from 'antd'
import { useNavigate } from 'react-router-dom'
import request from '@/utils/request'
import type { Exam } from '@/types'

export default function ExamList() {
  const navigate = useNavigate()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    setLoading(true)
    try {
      const res = await request.get('/student/exams')
      setExams(res.data)
    } catch (error) {
      // 静默处理错误
    } finally {
      setLoading(false)
    }
  }

  return (
    <Spin spinning={loading}>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={exams}
        renderItem={(exam) => (
          <List.Item>
            <Card title={exam.title} extra={<Tag color="blue">{exam.duration}分钟</Tag>}>
              <p>{exam.description}</p>
              <p>时间：{exam.startTime} 至 {exam.endTime}</p>
              <Button type="primary" onClick={() => navigate(`/student/exam/${exam.id}`)}>开始考试</Button>
            </Card>
          </List.Item>
        )}
      />
    </Spin>
  )
}