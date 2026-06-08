import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore'

// ========== Mock 数据存储 ==========
interface Question {
  id: string
  type: 'single' | 'multiple' | 'judge' | 'essay'
  content: string
  options?: string[]
  answer?: string | string[]
  score: number
  createTime: string
}

interface Exam {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  duration: number
  totalScore: number
  questionIds: string[]
  status: '未开始' | '进行中' | '已结束'
  createTime: string
}

interface Score {
  id: string
  examId: string
  examTitle: string
  studentId: string
  studentName: string
  score: number
  answers: Record<string, any>
  submitTime: string
}

// 内存数据存储
const mockStore = {
  users: [] as any[],
  questions: [] as Question[],
  exams: [] as Exam[],
  scores: [] as Score[],
}

// 模拟 JWT token
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 初始化一些示例数据
function initMockData() {
  // 初始化题目 - 按照4道题总分100分的标准设置分值
  mockStore.questions = [
    {
      id: 'q1',
      type: 'single',
      content: '下面哪个是JavaScript的数据类型？',
      options: ['String', 'Number', 'Boolean', '以上都是'],
      answer: '3',  // 正确答案是索引3，即"以上都是"
      score: 25,     // 单选题25分
      createTime: '2026-06-01 10:00',
    },
    {
      id: 'q2',
      type: 'multiple',
      content: 'JavaScript中的原始数据类型包括哪些？',
      options: ['string', 'number', 'boolean', 'object'],
      answer: ['0', '1', '2'],  // 正确答案是索引0,1,2，即string、number、boolean（object不是原始类型）
      score: 30,                 // 多选题30分
      createTime: '2026-06-01 10:05',
    },
    {
      id: 'q3',
      type: 'judge',
      content: 'TypeScript是JavaScript的超集',
      answer: 'true',  // 正确答案是true（正确）
      score: 20,       // 判断题20分
      createTime: '2026-06-01 10:10',
    },
    {
      id: 'q4',
      type: 'essay',
      content: '请简述什么是RESTful API设计原则',
      score: 25,       // 简答题25分
      createTime: '2026-06-01 10:15',
    },
  ]

  // 初始化试卷
  mockStore.exams = [
    {
      id: 'e1',
      title: '前端开发基础测试',
      description: 'JavaScript、React基础知识',
      startTime: '2026-06-10 09:00',
      endTime: '2026-06-10 11:00',
      duration: 120,
      totalScore: 100,
      questionIds: ['q1', 'q2', 'q3', 'q4'],
      status: '进行中',
      createTime: '2026-06-05 14:00',
    },
  ]
}

// 判断是否需要使用真实后端API（仅登录注册使用真实后端）
const shouldUseRealBackend = (url: string | undefined) => {
  if (!url) return false
  return url.includes('/auth/login') || url.includes('/auth/register')
}

// Mock 请求处理
function mockRequest(config: any): any {
  const { url, method, data } = config
  let bodyData: any = {}

  // 处理不同格式的数据
  if (data) {
    try {
      bodyData = JSON.parse(data)
    } catch {
      if (data instanceof URLSearchParams || typeof data === 'string') {
        const params = typeof data === 'string' ? new URLSearchParams(data) : data
        bodyData = Object.fromEntries(params.entries())
      } else {
        bodyData = data
      }
    }
  }

  console.log(`[Mock] ${method?.toUpperCase()} ${url}`, bodyData)

  // ========== 登录接口 ==========
  if (url === '/auth/login' || url?.endsWith('/auth/login')) {
    const { username, password } = bodyData
    if (username && password) {
      const mockUser = {
        id: generateId(),
        username,
        name: username,
        role: 'student',
      }
      const token = `mock_token_${mockUser.id}_${Date.now()}`
      return {
        code: 200,
        data: {
          token,
          user: mockUser,
          message: '登录成功'
        }
      }
    }
    return Promise.reject(new Error('用户名或密码错误'))
  }

  // ========== 注册接口 ==========
  if (url === '/auth/register' || url?.endsWith('/auth/register')) {
    const { name, phone, password: _password, role } = bodyData
    const newUser = {
      id: generateId(),
      username: name,
      name,
      phone,
      role: role || 'student',
    }
    mockStore.users.push(newUser)
    return {
      code: 200,
      data: { id: newUser.id, message: '注册成功' }
    }
  }

  // ========== 获取用户信息 ==========
  if (url === '/auth/profile' || url?.endsWith('/auth/profile')) {
    return {
      code: 200,
      data: {
        id: 'current_user',
        username: 'current_user',
        name: '当前用户',
        role: 'student',
      }
    }
  }

  // 题库管理接口
  if (url === '/teacher/questions' || url?.endsWith('/teacher/questions')) {
    if (method === 'get') {
      return { code: 200, data: mockStore.questions }
    }
    if (method === 'post') {
      let options = bodyData.options
      if (options && typeof options === 'string') {
        try {
          options = JSON.parse(options)
        } catch {
          options = undefined
        }
      }
      
      const newQuestion: Question = {
        id: generateId(),
        ...bodyData,
        options,
        createTime: new Date().toLocaleString(),
      }
      mockStore.questions.push(newQuestion)
      console.log('[Mock] 题目添加成功:', newQuestion)
      return { code: 200, data: newQuestion, message: '添加成功' }
    }
  }

  // 删除题目
  const deleteQuestionMatch = url?.match(/\/teacher\/questions\/(.+)/)
  if (deleteQuestionMatch && method === 'delete') {
    const id = deleteQuestionMatch[1]
    mockStore.questions = mockStore.questions.filter((q) => q.id !== id)
    return { code: 200, data: null, message: '删除成功' }
  }

  // 更新题目
  const updateQuestionMatch = url?.match(/\/teacher\/questions\/(.+)/)
  if (updateQuestionMatch && method === 'put') {
    const id = updateQuestionMatch[1]
    const index = mockStore.questions.findIndex((q) => q.id === id)
    if (index > -1) {
      mockStore.questions[index] = { ...mockStore.questions[index], ...bodyData }
      console.log('[Mock] 题目更新成功:', mockStore.questions[index])
      return { code: 200, data: mockStore.questions[index], message: '更新成功' }
    }
  }

  // 考试列表简单接口（用于下拉选择）
  if (url === '/teacher/exams/simple' || url?.endsWith('/teacher/exams/simple')) {
    return { code: 200, data: mockStore.exams.map((e) => ({ id: e.id, title: e.title })) }
  }

  // 考试管理接口
  if (url === '/teacher/exams' || url?.endsWith('/teacher/exams')) {
    if (method === 'get') {
      const examsWithDetails = mockStore.exams.map((exam) => ({
        ...exam,
        questions: mockStore.questions.filter((q) => exam.questionIds.includes(q.id)),
      }))
      return { code: 200, data: examsWithDetails }
    }
    if (method === 'post') {
      const newExam: Exam = {
        id: generateId(),
        ...bodyData,
        questionIds: bodyData.questionIds || [],
        status: '未开始',
        createTime: new Date().toLocaleString(),
      }
      mockStore.exams.push(newExam)
      return { code: 200, data: newExam, message: '创建成功' }
    }
  }

  // 更新考试
  const updateExamMatch = url?.match(/\/teacher\/exams\/(.+)/)
  if (updateExamMatch && method === 'put') {
    const id = updateExamMatch[1]
    const examIndex = mockStore.exams.findIndex((e) => e.id === id)
    if (examIndex > -1) {
      mockStore.exams[examIndex] = { ...mockStore.exams[examIndex], ...bodyData }
      return { code: 200, data: mockStore.exams[examIndex], message: '更新成功' }
    }
  }

  // 删除试卷
  const deleteExamMatch = url?.match(/\/teacher\/exams\/(.+)/)
  if (deleteExamMatch && method === 'delete') {
    const id = deleteExamMatch[1]
    mockStore.exams = mockStore.exams.filter((e) => e.id !== id)
    return { code: 200, data: null, message: '删除成功' }
  }

  // 学生端 - 获取考试列表
  if (url === '/student/exams' || url?.endsWith('/student/exams')) {
    const examsWithDetails = mockStore.exams.map((exam) => ({
      ...exam,
      questions: mockStore.questions.filter((q) => exam.questionIds.includes(q.id)),
    }))
    return { code: 200, data: examsWithDetails }
  }

  // 学生端 - 获取单个考试详情
  const studentExamMatch = url?.match(/\/student\/exams\/(.+)/)
  if (studentExamMatch && method === 'get') {
    const id = studentExamMatch[1]
    const exam = mockStore.exams.find((e) => e.id === id)
    if (exam) {
      return {
        code: 200,
        data: {
          ...exam,
          questions: mockStore.questions.filter((q) => exam.questionIds.includes(q.id)),
        },
      }
    }
  }

  // 学生端 - 提交答案
  const submitExamMatch = url?.match(/\/student\/exams\/(.+)\/submit/)
  if (submitExamMatch && method === 'post') {
    const examId = submitExamMatch[1]
    const exam = mockStore.exams.find((e) => e.id === examId)
    if (exam) {
      // 获取试卷中的所有题目
      const questions = mockStore.questions.filter((q) => exam.questionIds.includes(q.id))
      
      console.log('[Mock] 开始评分', {
        examId,
        examTitle: exam.title,
        questionsCount: questions.length,
        userAnswers: bodyData.answers
      })
      
      // 计算总分
      let totalScore = 0
      
      questions.forEach((question) => {
        const userAnswer = bodyData.answers[question.id]
        
        console.log(`[Mock] 评题 ${question.id} (${question.type})`, {
          userAnswer,
          correctAnswer: question.answer,
          options: question.options,
          score: question.score
        })
        
        // 简答题特殊处理：检查是否有内容
        if (question.type === 'essay') {
          // 如果用户没有填写简答题内容，不得分
          if (!userAnswer || userAnswer.trim() === '') {
            console.log(`[Mock] 简答题未填写，得0分`)
            return
          } else {
            // 简答题已填写，给满分（Mock模式下简化处理）
            totalScore += question.score
            console.log(`[Mock] 简答题已填写，得${question.score}分`)
          }
        } 
        // 客观题处理：对比答案
        else if (question.type === 'single') {
          // 单选题：支持两种格式
          // 1. 用户提交选项文本（如 "String"），答案是索引（如 "3"）
          // 2. 用户提交索引，答案也是索引
          
          let isCorrect = false
          
          if (question.options && Array.isArray(question.options)) {
            // 尝试将用户答案转换为索引
            const userIndex = question.options.indexOf(userAnswer)
            
            if (userIndex !== -1) {
              // 用户提交的是选项文本，需要转换为索引比较
              isCorrect = String(userIndex) === String(question.answer)
            } else {
              // 用户提交的可能是索引，直接比较
              isCorrect = String(userAnswer) === String(question.answer)
            }
          } else {
            // 没有选项，直接比较
            isCorrect = String(userAnswer) === String(question.answer)
          }
          
          if (isCorrect) {
            totalScore += question.score
            console.log(`[Mock] 单选题答案正确，得${question.score}分`)
          } else {
            console.log(`[Mock] 单选题答案错误，得0分 (期望: ${question.answer}, 实际: ${userAnswer})`)
          }
        }
        else if (question.type === 'judge') {
          // 判断题：支持两种格式
          // 1. 用户提交 "正确"/"错误"，答案是 "true"/"false"
          // 2. 用户提交 "true"/"false"，答案也是 "true"/"false"
          
          let isCorrect = false
          
          // 标准化用户答案
          let normalizedUserAnswer = userAnswer
          if (userAnswer === '正确') normalizedUserAnswer = 'true'
          else if (userAnswer === '错误') normalizedUserAnswer = 'false'
          
          // 标准化正确答案
          let normalizedCorrectAnswer = question.answer
          if (question.answer === '正确') normalizedCorrectAnswer = 'true'
          else if (question.answer === '错误') normalizedCorrectAnswer = 'false'
          
          isCorrect = normalizedUserAnswer === normalizedCorrectAnswer
          
          if (isCorrect) {
            totalScore += question.score
            console.log(`[Mock] 判断题答案正确，得${question.score}分`)
          } else {
            console.log(`[Mock] 判断题答案错误，得0分 (期望: ${question.answer}, 实际: ${userAnswer})`)
          }
        } 
        else if (question.type === 'multiple') {
          // 多选题：支持两种格式
          // 1. 用户提交选项文本数组（如 ["string", "number"]），答案是索引数组（如 ["0", "1"]）
          // 2. 用户提交索引数组，答案也是索引数组
          
          const correctAnswers = Array.isArray(question.answer) ? question.answer : []
          const userAnswers = Array.isArray(userAnswer) ? userAnswer : []
          
          // 如果用户提交的是选项文本，需要转换为索引
          let normalizedUserAnswers = userAnswers
          if (question.options && Array.isArray(question.options) && userAnswers.length > 0) {
            // 检查第一个元素是否是文本（不是数字索引）
            const firstElement = userAnswers[0]
            if (typeof firstElement === 'string' && !/^\d+$/.test(firstElement)) {
              // 用户提交的是选项文本，转换为索引
              normalizedUserAnswers = userAnswers.map((ans: string) => {
                const index = question.options!.indexOf(ans)
                return index !== -1 ? String(index) : ans
              })
            }
          }
          
          // 排序后比较
          const sortedCorrect = [...correctAnswers].sort()
          const sortedUser = [...normalizedUserAnswers].sort()
          
          if (JSON.stringify(sortedCorrect) === JSON.stringify(sortedUser)) {
            totalScore += question.score
            console.log(`[Mock] 多选题完全匹配，得${question.score}分`)
          } else {
            console.log(`[Mock] 多选题不匹配，得0分 (期望: ${JSON.stringify(correctAnswers)}, 实际: ${JSON.stringify(normalizedUserAnswers)})`)
          }
        }
      })
      
      console.log('[Mock] 最终得分:', totalScore)
      
      const newScore: Score = {
        id: generateId(),
        examId,
        examTitle: exam.title,
        studentId: 's1',
        studentName: '当前用户',
        score: totalScore,
        answers: bodyData.answers,
        submitTime: new Date().toLocaleString(),
      }
      mockStore.scores.push(newScore)
      return { code: 200, data: { score: totalScore }, message: '提交成功' }
    }
  }

  // 教师端 - 成绩管理（支持带查询参数）
  if (url?.startsWith('/teacher/scores') || url?.endsWith('/teacher/scores')) {
    return { code: 200, data: mockStore.scores }
  }

  // 学生端 - 成绩查询
  if (url === '/student/scores' || url?.endsWith('/student/scores')) {
    const studentScores = mockStore.scores.filter((s) => s.studentId === 's1')
    return { code: 200, data: studentScores }
  }

  console.warn(`[Mock] 未匹配的接口: ${method?.toUpperCase()} ${url}`)
  return { code: 200, data: null }
}

// 初始化 Mock 数据
initMockData()

// ========== Axios 配置 ==========
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 处理 Mock
request.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Mock 模式：直接返回模拟数据
  if (!shouldUseRealBackend(config.url)) {
    const mockResponse = mockRequest(config)
    // 返回一个已解决的 Promise，阻止真实请求
    return Promise.reject({
      __isMock: true,
      config,
      data: mockResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
    })
  }

  return config
})

// 响应拦截器 - 处理 Mock 响应和错误
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 如果是 Mock 响应
    if (error.__isMock) {
      return Promise.resolve(error.data)
    }
    
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default request
