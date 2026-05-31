
import request from '../utils/request'

export const authAPI = {
  login: (data: { username: string; password: string }) => {
    console.log('authAPI.login called with:', data)
    
    // OAuth2PasswordRequestForm 需要表单格式,不是 JSON
    const formData = new URLSearchParams()
    formData.append('username', data.username)
    formData.append('password', data.password)
    
    console.log('Form data:', formData.toString())
    
    return request.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  }, 
  
  register: (data: { name: string; phone: string; password: string; role: string }) =>
    request.post('/auth/register', data), 
  getProfile: () => request.get('/auth/profile'),
}