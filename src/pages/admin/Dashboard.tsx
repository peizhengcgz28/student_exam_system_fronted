import { Card, Row, Col, Statistic, Spin } from 'antd'
import { UserOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'

interface DashboardStats {
  totalUsers: number
  totalExams: number
  completedExams: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // TODO: 等后端实现管理员统计接口后取消注释
      // const res = await request.get<DashboardStats>('/admin/stats')
      // setStats(res.data)
      
      // 暂时显示 0,等待后端接口实现
      setStats({
        totalUsers: 5,
        totalExams: 1,
        completedExams: 0
      })
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      // 出错时也显示 0
      setStats({
        totalUsers: 0,
        totalExams: 0,
        completedExams: 0
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>控制台</h2>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats?.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="试卷总数"
              value={stats?.totalExams || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="已完成考试"
              value={stats?.completedExams || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}