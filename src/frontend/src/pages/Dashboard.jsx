import { useEffect, useState } from 'react'
import api from '../api'
import { formatVND } from '../utils'
import { useAuth } from '../context/AuthContext.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/statistics').then((r) => setStats(r.data)).catch(() => {})
  }, [])

  return (
    <div>
      <h2>Xin chào, {user?.full_name} 👋</h2>
      <p className="muted">Tổng quan hoạt động thu phí của chung cư.</p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Tổng đã thu</div>
          <div className="stat-value">{formatVND(stats?.total_collected)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Số lượt nộp</div>
          <div className="stat-value">{stats?.total_payments ?? '-'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Số khoản thu</div>
          <div className="stat-value">{stats?.total_fees ?? '-'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Đóng góp tự nguyện</div>
          <div className="stat-value">{formatVND(stats?.voluntary_collected)}</div>
        </div>
      </div>
    </div>
  )
}
