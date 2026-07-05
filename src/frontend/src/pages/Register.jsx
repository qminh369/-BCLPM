import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', apartment_code: '', role: 'resident',
  })
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      setOk(true)
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.response?.data?.detail || 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Đăng ký tài khoản</h1>
        {error && <div className="alert">{error}</div>}
        {ok && <div className="alert success">Đăng ký thành công! Đang chuyển tới trang đăng nhập...</div>}
        <label>Họ và tên</label>
        <input name="full_name" value={form.full_name} onChange={change} required />
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={change} required />
        <label>Mật khẩu (tối thiểu 6 ký tự)</label>
        <input name="password" type="password" value={form.password} onChange={change} minLength={6} required />
        <label>Mã căn hộ</label>
        <input name="apartment_code" value={form.apartment_code} onChange={change} placeholder="VD: A-1201" />
        <label>Vai trò</label>
        <select name="role" value={form.role} onChange={change}>
          <option value="resident">Cư dân</option>
          <option value="admin">Ban quản lý</option>
        </select>
        <button className="btn" disabled={loading}>{loading ? 'Đang xử lý...' : 'Đăng ký'}</button>
        <p className="muted center">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  )
}
