import axios from 'axios'

// baseURL = '/api' → dev thì Vite proxy, production thì Nginx proxy tới backend
const api = axios.create({ baseURL: '/api' })

// Gắn token vào mọi request nếu đã đăng nhập
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Tự đăng xuất khi token hết hạn
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
