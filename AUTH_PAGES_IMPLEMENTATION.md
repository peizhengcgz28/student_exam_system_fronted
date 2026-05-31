# 登录/注册页面实现说明

## ✅ 已完成的任务

### 1. 登录页面 (`src/pages/auth/Login.tsx`)

#### 功能特性：
- **手机号 + 密码表单**
  - 使用 `Input` 组件收集手机号和密码
  - 集成 Ant Design Form 校验规则
  
- **Form 校验规则**：
  - 手机号：必填 + 正则验证（`/^1[3-9]\d{9}$/`）
  - 密码：必填 + 最少6位
  
- **角色选择**：
  - 使用 `Select` 组件选择登录身份
  - 支持三种角色：学生、教师、管理员
  - 默认选中"学生"
  
- **集成 authService**：
  - 调用 `authAPI.login()` 方法
  - API 地址：`POST /auth/login`
  - 从响应中获取 token 和用户信息
  
- **不同角色登录效果**：
  ```typescript
  const routeMap: Record<string, string> = {
    student: '/student/exams',      // 学生 → 考试列表
    teacher: '/teacher/questions',  // 教师 → 题库管理
    admin: '/admin/dashboard',      // 管理员 → 控制台
  }
  ```

#### UI 设计：
- 居中卡片布局
- 大尺寸输入框和按钮
- 加载状态显示
- 灰色背景 (#f0f2f5)
- 卡片阴影效果

---

### 2. 注册页面 (`src/pages/auth/Register.tsx`)

#### 功能特性：
- **完整注册表单**：
  - 手机号（带格式校验）
  - 密码（最少6位）
  - 确认密码（与密码一致性校验）
  - 角色选择（学生/教师）
  
- **Form 校验规则**：
  - 手机号：必填 + 正则验证
  - 密码：必填 + 最少6位
  - 确认密码：必填 + 与密码一致
  - 角色：必选
  
- **角色选择 (Select 组件)**：
  - 初始值为 "student"
  - 选项：学生、教师
  - 管理员角色暂不开放注册
  
- **集成 authService**：
  - 调用 `authAPI.register()` 方法
  - API 地址：`POST /auth/register`
  - 注册成功后跳转到登录页

#### UI 设计：
- 与登录页面保持一致的风格
- 垂直布局的表单
- 清晰的标签和提示

---

### 3. 认证服务 (`src/services/auth.ts`)

已预留 API 接口：
```typescript
export const authAPI = {
  login: (data: { username: string; password: string }) =>
    request.post('/auth/login', data),
  register: (data: { username: string; password: string; role: string }) =>
    request.post('/auth/register', data),
  getProfile: () => request.get('/auth/profile'),
}
```

---

## 🎯 不同角色登录效果

### 学生角色 (`student`)
- **登录后跳转**：`/student/exams`（我的考试列表）
- **侧边菜单**：
  - 我的考试
  - 成绩查询
- **权限**：只能查看和参加自己的考试

### 教师角色 (`teacher`)
- **登录后跳转**：`/teacher/questions`（题库管理）
- **侧边菜单**：
  - 题库管理
  - 试卷管理
  - 成绩管理
  - 智能导入
- **权限**：可以管理题库、创建试卷、查看学生成绩

### 管理员角色 (`admin`)
- **登录后跳转**：`/admin/dashboard`（控制台）
- **侧边菜单**：
  - 控制台
  - 用户管理
  - 系统设置
- **权限**：系统级管理功能

---

## 📋 实现细节

### 登录流程
1. 用户输入手机号和密码
2. 选择登录身份（学生/教师/管理员）
3. 点击登录按钮
4. 调用 `authAPI.login()` 发送请求
5. 获取 token 和用户信息
6. 使用 Zustand store 存储认证状态
7. 根据选择的角色跳转到对应页面

### 注册流程
1. 用户填写手机号、密码、确认密码
2. 选择注册身份（学生/教师）
3. 点击注册按钮
4. 调用 `authAPI.register()` 发送请求
5. 注册成功后跳转到登录页

### 表单校验示例
```typescript
// 手机号校验
{
  required: true,
  message: '请输入手机号'
},
{
  pattern: /^1[3-9]\d{9}$/,
  message: '请输入有效的手机号'
}

// 密码确认校验
({ getFieldValue }) => ({
  validator(_, value) {
    if (!value || getFieldValue('password') === value) {
      return Promise.resolve()
    }
    return Promise.reject(new Error('两次输入的密码不一致'))
  },
})
```

---

## 🔒 安全特性

- ✅ 密码字段使用 `Input.Password` 组件（隐藏输入）
- ✅ 手机号格式验证
- ✅ 密码长度限制（最少6位）
- ✅ 确认密码一致性检查
- ✅ 加载状态防止重复提交
- ✅ 静默错误处理（生产环境可添加 toast 提示）

---

## 🚀 使用说明

### 测试登录
1. 访问 `/login` 页面
2. 输入手机号（如：13800138000）
3. 输入密码（至少6位）
4. 选择登录身份
5. 点击"登录"按钮
6. 系统会根据角色自动跳转到对应页面

### 测试注册
1. 访问 `/register` 页面
2. 填写手机号、密码、确认密码
3. 选择注册身份
4. 点击"注册"按钮
5. 注册成功后自动跳转到登录页

---

## 📝 注意事项

1. **当前为静态页面**：API 调用已集成，但需要后端服务支持
2. **错误处理**：采用静默模式，实际项目中可添加用户友好的错误提示
3. **角色切换**：登录后可通过顶部导航的角色切换功能变更视图
4. **路由保护**：所有业务页面都受 `ProtectedRoute` 保护，未登录会自动跳转到登录页
