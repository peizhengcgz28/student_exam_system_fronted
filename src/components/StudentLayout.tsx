import { Outlet, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button } from 'antd'
import { FileTextOutlined, StarOutlined, LogoutOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/useAuthStore'

const { Header, Sider, Content } = Layout

export default function StudentLayout() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light">
        <div style={{ height: 32, margin: 16, textAlign: 'center' }}>学生考试系统</div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['exams']}
          items={[
            { key: 'exams', icon: <FileTextOutlined />, label: '我的考试', onClick: () => navigate('/student/exams') },
            { key: 'scores', icon: <StarOutlined />, label: '成绩查询', onClick: () => navigate('/student/scores') },
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