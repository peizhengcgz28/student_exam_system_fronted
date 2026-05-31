import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Radio, Checkbox, Input, Button, Space } from 'antd'
import request from '@/utils/request'
import type { Exam, Question } from '@/types'

export default function TakingExam() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState<Exam | null>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})

  useEffect(() => {
    request.get(`/student/exam/${id}`).then((res) => setExam(res.data))
  }, [id])

  const handleAnswer = (qid: string, value: any) => {
    setAnswers({ ...answers, [qid]: value })
  }

  const submitExam = async () => {
    await request.post(`/student/exam/${id}/submit`, { answers })
    navigate('/student/scores')
  }

  if (!exam) return <div>加载中...</div>

  return (
    <div>
      <h2>{exam.title}</h2>
      {exam.questions.map((q: Question, idx: number) => (
        <Card key={q.id} style={{ marginBottom: 16 }}>
          <p><strong>{idx + 1}. {q.content}</strong>（{q.score}分）</p>
          {q.type === 'single' && (
            <Radio.Group onChange={(e) => handleAnswer(q.id, e.target.value)}>
              <Space direction="vertical">
                {q.options?.map(opt => <Radio value={opt}>{opt}</Radio>)}
              </Space>
            </Radio.Group>
          )}
          {q.type === 'multiple' && (
            <Checkbox.Group onChange={(vals) => handleAnswer(q.id, vals)}>
              <Space direction="vertical">
                {q.options?.map(opt => <Checkbox value={opt}>{opt}</Checkbox>)}
              </Space>
            </Checkbox.Group>
          )}
          {q.type === 'judge' && (
            <Radio.Group onChange={(e) => handleAnswer(q.id, e.target.value)}>
              <Radio value="正确">正确</Radio>
              <Radio value="错误">错误</Radio>
            </Radio.Group>
          )}
          {q.type === 'essay' && (
            <Input.TextArea rows={4} onChange={(e) => handleAnswer(q.id, e.target.value)} />
          )}
        </Card>
      ))}
      <Button type="primary" size="large" onClick={submitExam}>提交试卷</Button>
    </div>
  )
}