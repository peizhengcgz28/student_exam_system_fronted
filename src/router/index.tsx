import { createBrowserRouter, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import AppLayout from '@/components/AppLayout'
import AdminLayout from '@/components/AdminLayout'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import ExamList from '@/pages/student/ExamList'
import TakingExam from '@/pages/student/TakingExam'
import ScoreList from '@/pages/student/ScoreList'
import QuestionBank from '@/pages/teacher/QuestionBank'
import ExamManage from '@/pages/teacher/ExamManage'
import ScoreManage from '@/pages/teacher/ScoreManage'
import SmartImport from '@/pages/teacher/SmartImport'
import Dashboard from '@/pages/admin/Dashboard'
import UserManagement from '@/pages/admin/UserManagement'
import SystemSettings from '@/pages/admin/SystemSettings'
import NotFound from '@/pages/NotFound'

const ProtectedRoute = ({ children, allowedRoles }: { children: ReactNode; allowedRoles: string[] }) => {
  const user = useAuthStore((state) => state.user)
  if (!user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/student/exams" replace />,
      },
    ],
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute allowedRoles={['student']}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="exams" replace /> },
      { path: 'exams', element: <ExamList /> },
      { path: 'exam/:id', element: <TakingExam /> },
      { path: 'scores', element: <ScoreList /> },
    ],
  },
  {
    path: '/teacher',
    element: (
      <ProtectedRoute allowedRoles={['teacher']}>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="questions" replace /> },
      { path: 'questions', element: <QuestionBank /> },
      { path: 'exams', element: <ExamManage /> },
      { path: 'scores', element: <ScoreManage /> },
      { path: 'import', element: <SmartImport /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'settings', element: <SystemSettings /> },
    ],
  },
  { path: '*', element: <NotFound /> },
])

export default router
