import { Table, Card, Tag, Space, Button, Input, Select, Empty } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'
import request from '@/utils/request'

const { Option } = Select

interface User {
  id: number
  username: string
  phone: string
  role: 'admin' | 'teacher' | 'student'
  status: 'active' | 'inactive'
  createdAt: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // TODO: 等后端实现管理员用户列表接口后取消注释
      // const res = await request.get<User[]>('/admin/users')
      // setUsers(res.data)
      
      // 暂时显示空数组,等待后端接口实现
      setUsers([])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  // 过滤用户
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchText.toLowerCase()) || 
                         user.phone.includes(searchText)
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { 
      title: '角色', 
      dataIndex: 'role', 
      key: 'role',
      render: (role: string) => {
        const colorMap: Record<string, string> = {
          admin: 'red',
          teacher: 'blue',
          student: 'green'
        }
        const labelMap: Record<string, string> = {
          admin: '管理员',
          teacher: '教师',
          student: '学生'
        }
        return <Tag color={colorMap[role] || 'default'}>{labelMap[role] || role}</Tag>
      }
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      )
    },
    { title: '注册时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space>
          <Button icon={<EditOutlined />} size="small">编辑</Button>
          <Button icon={<DeleteOutlined />} size="small" danger>删除</Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>用户管理</h2>
      
      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="搜索用户名或手机号"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: 150 }}
          >
            <Option value="all">全部角色</Option>
            <Option value="admin">管理员</Option>
            <Option value="teacher">教师</Option>
            <Option value="student">学生</Option>
          </Select>
        </Space>
      </Card>

      {/* 用户列表 */}
      <Card>
        {filteredUsers.length === 0 && !loading ? (
          <Empty description="暂无用户数据" />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    </div>
  )
}