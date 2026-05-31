# 路由与布局骨架实现说明

## ✅ 已完成的任务

### 1. 路由配置 (`src/router/index.tsx`)

已定义以下路由：
- `/` - 根路径，重定向到 `/dashboard`
- `/login` - 登录页面
- `/register` - 注册页面
- `/dashboard` - 默认仪表盘（根据角色重定向）
- `/student/*` - 学生端路由（受保护）
- `/teacher/*` - 教师端路由（受保护）
- `/admin/*` - 管理员路由（受保护）
- `*` - 404 页面

### 2. 布局组件实现

#### 通用布局组件 (`src/components/AppLayout.tsx`)
包含以下部分：
- **顶部导航 (Header)**: 
  - 系统标题
  - 角色切换下拉菜单
  - 用户信息展示
  - 退出登录按钮
  
- **侧边菜单 (Sider)**:
  - 根据当前用户角色动态生成菜单项
  - 学生端：我的考试、成绩查询
  - 教师端：题库管理、试卷管理、成绩管理、智能导入
  - 管理员：控制台、用户管理、系统设置
  
- **主内容区 (Content)**:
  - 使用 `<Outlet />` 渲染子路由页面
  
- **底部 (Footer)**:
  - 版权信息

#### 管理员布局 (`src/components/AdminLayout.tsx`)
- 复用通用布局组件

### 3. 角色切换功能

在顶部导航中实现了角色切换下拉菜单：
- 学生端 → 跳转到 `/student/exams`
- 教师端 → 跳转到 `/teacher/questions`
- 管理员 → 跳转到 `/admin/dashboard`

### 4. 类型定义更新 (`src/types/index.ts`)

User 接口已支持三种角色：
```typescript
role: 'student' | 'teacher' | 'admin'
```

### 5. 管理员页面 (`src/pages/admin/Dashboard.tsx`)

创建了管理员控制台页面，展示统计信息卡片。

### 6. App.tsx 配置

已使用 `RouterProvider` 挂载路由（React Router v6.4+ 推荐方式）：
```tsx
<ConfigProvider locale={zhCN}>
  <RouterProvider router={router} />
</ConfigProvider>
```

## 📁 新增文件

1. `src/components/AppLayout.tsx` - 通用布局组件
2. `src/components/AdminLayout.tsx` - 管理员布局组件
3. `src/pages/admin/Dashboard.tsx` - 管理员控制台页面

## 🔄 修改文件

1. `src/types/index.ts` - 添加 'admin' 角色
2. `src/router/index.tsx` - 更新路由配置，添加 /dashboard 和管理员路由

## 🎯 功能特点

- ✅ 统一的布局结构（顶部导航 + 侧边菜单 + 底部）
- ✅ 基于角色的动态菜单
- ✅ 角色切换功能
- ✅ 路由权限保护
- ✅ 响应式设计
- ✅ TypeScript 类型安全

## 🚀 使用说明

1. 登录后，系统会根据用户角色自动跳转到对应页面
2. 通过顶部导航的角色切换下拉菜单，可以切换到其他角色视图
3. 侧边菜单会根据当前角色动态显示对应的功能模块
4. 所有受保护的路由都需要登录后才能访问
