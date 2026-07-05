import { useEffect, useState } from 'react'
import api from '../api'
import { formatVND, formatDate } from '../utils'
import { useAuth } from '../context/AuthContext.jsx'

export default function Payments() {
  const { isAdmin } = useAuth()
  const [payments, setPayments] = useState([])
  const [fees, setFees] = useState([])
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ fee_id: '', user_id: '', amount: '', note: '' })
  const [error, setError] = useState('')

  const load = async () => {
    const [p, f] = await Promise.all([api.get('/payments'), api.get('/fees')])
    setPayments(p.data)
    setFees(f.data)
    if (isAdmin) {
      const u = await api.get('/users')
      setUsers(u.data)
    }
  }

  useEffect(() => { load() }, [])

  const change = (e) => {
    const next = { ...form, [e.target.name]: e.target.value }
    // Tự điền số tiền định mức khi chọn khoản thu
    if (e.target.name === 'fee_id') {
      const fee = fees.find((x) => String(x.id) === e.target.value)
      if (fee && !form.amount) next.amount = fee.amount
    }
    setForm(next)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/payments', {
        fee_id: parseInt(form.fee_id),
        user_id: form.user_id ? parseInt(form.user_id) : null,
        amount: parseFloat(form.amount) || 0,
        note: form.note || null,
      })
      setForm({ fee_id: '', user_id: '', amount: '', note: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Không ghi nhận được khoản thu')
    }
  }

  const remove = async (id) => {
    if (!confirm('Xóa bản ghi thu phí này?')) return
    await api.delete(`/payments/${id}`)
    load()
  }

  return (
    <div>
      <h2>Thu phí / Đóng góp</h2>
      <p className="muted">Ghi nhận việc nộp phí cho từng khoản thu.</p>

      <form className="card form-grid" onSubmit={submit}>
        {error && <div className="alert">{error}</div>}
        <div>
          <label>Khoản thu *</label>
          <select name="fee_id" value={form.fee_id} onChange={change} required>
            <option value="">-- Chọn khoản thu --</option>
            {fees.map((f) => (
              <option key={f.id} value={f.id}>{f.name} ({formatVND(f.amount)})</option>
            ))}
          </select>
        </div>
        {isAdmin && (
          <div>
            <label>Cư dân (thu hộ)</label>
            <select name="user_id" value={form.user_id} onChange={change}>
              <option value="">-- Tôi nộp cho chính mình --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name} {u.apartment_code ? `· ${u.apartment_code}` : ''}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label>Số tiền (VNĐ) *</label>
          <input name="amount" type="number" value={form.amount} onChange={change} required min="0" />
        </div>
        <div>
          <label>Ghi chú</label>
          <input name="note" value={form.note} onChange={change} placeholder="Tiền mặt / chuyển khoản..." />
        </div>
        <div className="full">
          <button className="btn">Ghi nhận thu phí</button>
        </div>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Khoản thu</th>{isAdmin && <th>Người nộp</th>}<th>Số tiền</th>
            <th>Ghi chú</th><th>Thời gian</th><th></th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.fee_name}</td>
              {isAdmin && <td>{p.user_name}{p.apartment_code ? ` · ${p.apartment_code}` : ''}</td>}
              <td>{formatVND(p.amount)}</td>
              <td className="small">{p.note || '-'}</td>
              <td className="small">{formatDate(p.paid_at)}</td>
              <td><button className="btn-link danger" onClick={() => remove(p.id)}>Xóa</button></td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr><td colSpan={isAdmin ? 6 : 5} className="muted center">Chưa có khoản thu nào được ghi nhận.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
