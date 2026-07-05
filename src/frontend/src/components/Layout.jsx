import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">🏢 Chung Cư</div>
        <nav>
          <NavLink to="/" end>Tổng quan</NavLink>
          <NavLink to="/fees">Khoản thu</NavLink>
          <NavLink to="/payments">Thu phí</NavLink>
          <NavLink to="/statistics">Thống kê</NavLink>
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div>
            <strong>{user?.full_name}</strong>
            <span className="badge">{user?.role === 'admin' ? 'Ban quản lý' : 'Cư dân'}</span>
            {user?.apartment_code && <span className="muted"> · {user.apartment_code}</span>}
          </div>
          <button className="btn-outline" onClick={handleLogout}>Đăng xuất</button>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
