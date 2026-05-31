import { Outlet, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button } from 'antd'
import { DatabaseOutlined, FileTextOutlined, BarChartOutlined, UploadOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/useAuthStore'

const { Header, Sider, Content } = Layout

export default function TeacherLayout() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light">
        <div style={{ height: 32, margin: 16, textAlign: 'center' }}>教师管理端</div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['questions']}
          items={[
            { key: 'questions', icon: <DatabaseOutlined />, label: '题库管理', onClick: () => navigate('/teacher/questions') },
            { key: 'exams', icon: <FileTextOutlined />, label: '试卷管理', onClick: () => navigate('/teacher/exams') },
            { key: 'scores', icon: <BarChartOutlined />, label: '成绩管理', onClick: () => navigate('/teacher/scores') },
            { key: 'import', icon: <UploadOutlined />, label: '智能导入', onClick: () => navigate('/teacher/import') },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>欢迎，{user?.username}</span>
          <Button icon={<LogoutOutlined />} onClick={() => { logout(); navigate('/login') }}>退出</Button>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}