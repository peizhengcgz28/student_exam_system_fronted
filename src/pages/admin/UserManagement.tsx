import { Table, Card, Tag, Space, Button, Input, Select, Empty, Modal, Form, message } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useState, useEffect } from 'react'

const { Option } = Select

interface User {
  id: number
  username: string
  phone: string
  role: 'admin' | 'teacher' | 'student'
  status: 'active' | 'inactive'
  createdAt: string
}

// 系统默认模拟数据
const defaultMockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    phone: '13800138000',
    role: 'admin',
    status: 'active',
    createdAt: '2025-01-01 10:00:00'
  },
  {
    id: 2,
    username: 'teacher_zhang',
    phone: '13800138001',
    role: 'teacher',
    status: 'active',
    createdAt: '2025-01-05 14:30:00'
  },
  {
    id: 3,
    username: 'teacher_li',
    phone: '13800138002',
    role: 'teacher',
    status: 'active',
    createdAt: '2025-01-10 09:15:00'
  },
  {
    id: 4,
    username: 'student_wang',
    phone: '13800138003',
    role: 'student',
    status: 'active',
    createdAt: '2025-02-01 11:20:00'
  },
  {
    id: 5,
    username: 'student_chen',
    phone: '13800138004',
    role: 'student',
    status: 'active',
    createdAt: '2025-02-15 16:45:00'
  }
]

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchMergedUsers()
  }, [])

  // 读取合并数据
  const fetchMergedUsers = () => {
    setLoading(true)
    setTimeout(() => {
      try {
        const localUsersStr = localStorage.getItem('registeredUsers')
        const localUsers: User[] = localUsersStr ? JSON.parse(localUsersStr) : []
        const mergedUsers = [...defaultMockUsers, ...localUsers]
        setUsers(mergedUsers)
      } catch (e) {
        setUsers(defaultMockUsers)
      } finally {
        setLoading(false)
      }
    }, 400)
  }

  // 保存用户数据到 localStorage
  const saveToLocalStorage = (newUsers: User[]) => {
    // 把非默认数据筛选出来存本地
    const localUsers = newUsers.filter(u => !defaultMockUsers.some(d => d.id === u.id))
    localStorage.setItem('registeredUsers', JSON.stringify(localUsers))
  }

  // 新增/编辑用户
  const handleSubmit = async () => {
    const values = await form.validateFields()
    const now = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-')

    if (editingUser) {
      // 编辑逻辑
      const newUsers = users.map(u => 
        u.id === editingUser.id ? { ...u, ...values } : u
      )
      setUsers(newUsers)
      saveToLocalStorage(newUsers)
      message.success('用户编辑成功')
    } else {
      // 新增逻辑
      const newId = Math.max(...users.map(u => u.id), 0) + 1
      const newUser: User = {
        id: newId,
        ...values,
        status: 'active',
        createdAt: now
      }
      const newUsers = [...users, newUser]
      setUsers(newUsers)
      saveToLocalStorage(newUsers)
      message.success('用户新增成功')
    }

    setModalVisible(false)
    form.resetFields()
    setEditingUser(null)
  }

  // 删除用户
  const handleDelete = (record: User) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户「${record.username}」吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const newUsers = users.filter(u => u.id !== record.id)
        setUsers(newUsers)
        saveToLocalStorage(newUsers)
        message.success('删除成功')
      }
    })
  }

  // 打开编辑弹窗
  const handleEdit = (record: User) => {
    setEditingUser(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  // 打开新增弹窗
  const handleAdd = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  // 搜索筛选
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      (user.phone && user.phone.includes(searchText))
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
          {status === 'active' ? '正常' : '禁用'}
        </Tag>
      )
    },
    { title: '注册时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: any, record: User) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            type="primary"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2>用户管理</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          新增用户
        </Button>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索用户名/手机号"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 280 }}
            allowClear
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

      <Card>
        {filteredUsers.length === 0 && !loading ? (
          <Empty description="暂无用户数据" />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingUser(null)
          form.resetFields()
        }}
        onOk={handleSubmit}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="手机号"
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' }
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="admin">管理员</Option>
              <Option value="teacher">教师</Option>
              <Option value="student">学生</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}