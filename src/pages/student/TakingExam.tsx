import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Radio, Checkbox, Input, Button, Space } from 'antd'
import request from '@/utils/request'
import type { Exam, Question } from '@/types'

// 将索引转换为字母标识（0->A, 1->B, 2->C, 3->D）
const indexToLetter = (index: number): string => {
  return String.fromCharCode(65 + index) // 65是'A'的ASCII码
}

export default function TakingExam() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState<Exam | null>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})

  useEffect(() => {
    request.get(`/student/exams/${id}`).then((res) => setExam(res.data))
  }, [id])

  const handleAnswer = (qid: string, value: any) => {
    setAnswers({ ...answers, [qid]: value })
  }

  const submitExam = async () => {
    await request.post(`/student/exams/${id}/submit`, { answers })
    navigate('/student/scores')
  }

  if (!exam) return <div>加载中...</div>

  return (
    <div>
      <h2>{exam.title}</h2>
      {exam.questions.map((q: Question, idx: number) => (
        <Card key={q.id} style={{ marginBottom: 16 }}>
          <p><strong>{idx + 1}. {q.content}</strong>（{q.score}分）</p>
          {q.type === 'single' && q.options && (
            <Radio.Group onChange={(e) => handleAnswer(q.id, e.target.value)}>
              <Space direction="vertical">
                {q.options.map((opt, optIdx) => (
                  <Radio key={optIdx} value={opt}>
                    {indexToLetter(optIdx)}. {opt}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          )}
          {q.type === 'multiple' && q.options && (
            <Checkbox.Group onChange={(vals) => handleAnswer(q.id, vals)}>
              <Space direction="vertical">
                {q.options.map((opt, optIdx) => (
                  <Checkbox key={optIdx} value={opt}>
                    {indexToLetter(optIdx)}. {opt}
                  </Checkbox>
                ))}
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
            <Input.TextArea rows={4} onChange={(e) => handleAnswer(q.id, e.target.value)} placeholder="请输入你的答案..." />
          )}
        </Card>
      ))}
      <Button type="primary" size="large" onClick={submitExam}>提交试卷</Button>
    </div>
  )
}
