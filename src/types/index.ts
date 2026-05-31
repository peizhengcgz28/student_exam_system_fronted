export interface User {
  id: string
  username: string
  role: 'student' | 'teacher' | 'admin'
  avatar?: string
}

export interface Question {
  id: string
  type: 'single' | 'multiple' | 'judge' | 'essay'
  content: string
  options?: string[]
  answer?: string | string[]
  score: number
}

export interface Exam {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  duration: number
  questions: Question[]
  totalScore: number
}

export interface Score {
  examId: string
  examTitle: string
  studentId: string
  studentName: string
  score: number
  submitTime: string
}