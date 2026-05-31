import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import type { MenuProps } from 'antd'
import { Layout, Menu, Button, Dropdown, Space, Avatar } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  DashboardOutlined,
  FileTextOutlined,
  StarOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  UploadOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store/useAuthStore'

const { Header, Sider, Content, Footer } = Layout

// 根据角色生成菜单项
const getMenuItems = (role: string): MenuProps['items'] => {
  const menuMap: Record<string, MenuProps['items']> = {
    student: [
      { key: '/student/exams', icon: <FileTextOutlined />, label: '我的考试' },
      { key: '/student/scores', icon: <StarOutlined />, label: '成绩查询' },
    ],
    teacher: [
      { key: '/teacher/questions', icon: <DatabaseOutlined />, label: '题库管理' },
      { key: '/teacher/exams', icon: <FileTextOutlined />, label: '试卷管理' },
      { key: '/teacher/scores', icon: <BarChartOutlined />, label: '成绩管理' },
      { key: '/teacher/import', icon: <UploadOutlined />, label: '智能导入' },
    ],
    admin: [
      { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '控制台' },
      { key: '/admin/users', icon: <UserOutlined />, label: '用户管理' },
      { key: '/admin/settings', icon: <SettingOutlined />, label: '系统设置' },
    ],
  }
  return menuMap[role] || []
}

// 角色切换选项
const roleOptions = [
  { key: 'student', label: '学生端' },
  { key: 'teacher', label: '教师端' },
  { key: 'admin', label: '管理员' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  if (!user) {
    return <Outlet />
  }

  const handleRoleChange = ({ key }: { key: string }) => {
    // 切换到对应角色的首页
    const routeMap: Record<string, string> = {
      student: '/student/exams',
      teacher: '/teacher/questions',
      admin: '/admin/dashboard',
    }
    navigate(routeMap[key] || '/login')
  }

  const menuItems = getMenuItems(user.role)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 顶部导航 */}
      <Header
        style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1,
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
          学生考试系统
        </div>

        <Space size="large">
          {/* 角色切换下拉菜单 */}
          <Dropdown menu={{ items: roleOptions, onClick: handleRoleChange }} placement="bottomRight">
            <Button type="text">
              <Space>
                {roleOptions.find((r) => r.key === user.role)?.label}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>

          {/* 用户信息 */}
          <Space>
            <Avatar icon={<UserOutlined />} />
            <span>{user.username}</span>
          </Space>

          {/* 退出登录 */}
          <Button
            icon={<LogoutOutlined />}
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            退出
          </Button>
        </Space>
      </Header>

      <Layout>
        {/* 侧边菜单 */}
        <Sider theme="light" width={220} style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.05)' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0, marginTop: 8 }}
          />
        </Sider>

        {/* 主内容区 */}
        <Layout style={{ background: '#f0f2f5' }}>
          <Content style={{ margin: '24px 16px', minHeight: 'calc(100vh - 132px)' }}>
            <div style={{ padding: 24, background: '#fff', borderRadius: 8, minHeight: '100%' }}>
              <Outlet />
            </div>
          </Content>

          {/* 底部 */}
          <Footer style={{ textAlign: 'center', background: '#fff', padding: '16px 24px' }}>
            © 2026 学生考试系统 - All Rights Reserved
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  )
}
