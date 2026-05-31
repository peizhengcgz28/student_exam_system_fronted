# 学生作答系统 - 前端服务

- 基于 React + TypeScript 的单页应用，提供学生端考试作答与教师端管理界面。

## 技术栈 (参考)

- React 24 + TypeScript
- Vite
- Ant Design 5
- React Router 6
- Zustand (状态管理)
- Axios
- Recharts (图表)
- React Beautiful DnD (拖拽排序)

## 项目结构 (参考)

```
frontend/
├── public/
├── src/
│ ├── assets/ # 静态资源
│ ├── components/ # 公共组件
│ ├── hooks/ # 自定义 Hook
│ ├── pages/ # 页面
│ │ ├── auth/ # 登录/注册
│ │ ├── student/ # 学生端（试卷、作答、成绩）
│ │ ├── teacher/ # 教师端（题库、试卷、成绩、智能导入）
│ ├── services/ # API 请求封装
│ ├── store/ # 全局状态
│ ├── router/ # 路由配置
│ ├── types/ # TypeScript 类型定义
│ ├── utils/ # 工具函数
│ ├── App.tsx
│ └── main.tsx
├── .env.example
├── package.json
└── README.md
```

## 环境准备

1. **安装依赖**

```bash
npm install
``` 
   

2. 环境变量
- .env：

```ini
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

3. 启动开发服务器

```bash
npm run dev
```
