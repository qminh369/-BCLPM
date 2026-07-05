import { useEffect, useState } from 'react'
import api from '../api'
import { formatVND, categoryLabel } from '../utils'

export default function Statistics() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/statistics').then((r) => setStats(r.data))
  }, [])

  if (!stats) return <p className="muted">Đang tải thống kê...</p>

  const maxCollected = Math.max(...stats.by_fee.map((f) => f.total_collected), 1)

  return (
    <div>
      <h2>Thống kê các khoản đóng góp</h2>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Tổng đã thu</div>
          <div className="stat-value">{formatVND(stats.total_collected)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Khoản bắt buộc</div>
          <div className="stat-value">{formatVND(stats.mandatory_collected)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Khoản tự nguyện</div>
          <div className="stat-value">{formatVND(stats.voluntary_collected)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tổng lượt nộp</div>
          <div className="stat-value">{stats.total_payments}</div>
        </div>
      </div>

      <h3>Chi tiết theo khoản thu</h3>
      <div className="card">
        {stats.by_fee.length === 0 && <p className="muted center">Chưa có dữ liệu.</p>}
        {stats.by_fee.map((f) => (
          <div key={f.fee_id} className="bar-row">
            <div className="bar-info">
              <span>{f.fee_name} <span className={`tag ${f.category}`}>{categoryLabel(f.category)}</span></span>
              <span><strong>{formatVND(f.total_collected)}</strong> · {f.payment_count} lượt</span>
            </div>
            <div className="bar-track">
              <div
                className={`bar-fill ${f.category}`}
                style={{ width: `${(f.total_collected / maxCollected) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
