import { useEffect, useState } from 'react'
import api from '../api'
import { formatVND, formatDate, categoryLabel } from '../utils'
import { useAuth } from '../context/AuthContext.jsx'

const emptyForm = {
  name: '', description: '', amount: '', category: 'mandatory', period: '', due_date: '',
}

export default function Fees() {
  const { isAdmin } = useAuth()
  const [fees, setFees] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const load = () => api.get('/fees').then((r) => setFees(r.data))

  useEffect(() => { load() }, [])

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/fees', {
        ...form,
        amount: parseFloat(form.amount) || 0,
        due_date: form.due_date || null,
      })
      setForm(emptyForm)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Không tạo được khoản thu')
    }
  }

  const remove = async (id) => {
    if (!confirm('Xóa khoản thu này?')) return
    await api.delete(`/fees/${id}`)
    load()
  }

  return (
    <div>
      <div className="page-head">
        <h2>Khoản thu</h2>
        {isAdmin && (
          <button className="btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Đóng' : '+ Tạo khoản thu'}
          </button>
        )}
      </div>

      {!isAdmin && <p className="muted">Chỉ Ban quản lý mới có thể tạo khoản thu.</p>}

      {isAdmin && showForm && (
        <form className="card form-grid" onSubmit={submit}>
          {error && <div className="alert">{error}</div>}
          <div>
            <label>Tên khoản thu *</label>
            <input name="name" value={form.name} onChange={change} required placeholder="Phí quản lý tháng 7" />
          </div>
          <div>
            <label>Số tiền định mức (VNĐ) *</label>
            <input name="amount" type="number" value={form.amount} onChange={change} required min="0" />
          </div>
          <div>
            <label>Loại</label>
            <select name="category" value={form.category} onChange={change}>
              <option value="mandatory">Bắt buộc</option>
              <option value="voluntary">Tự nguyện</option>
            </select>
          </div>
          <div>
            <label>Kỳ thu</label>
            <input name="period" value={form.period} onChange={change} placeholder="07/2026" />
          </div>
          <div>
            <label>Hạn nộp</label>
            <input name="due_date" type="date" value={form.due_date} onChange={change} />
          </div>
          <div className="full">
            <label>Mô tả</label>
            <input name="description" value={form.description} onChange={change} />
          </div>
          <div className="full">
            <button className="btn">Lưu khoản thu</button>
          </div>
        </form>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Tên</th><th>Loại</th><th>Định mức</th><th>Kỳ</th>
            <th>Đã thu</th><th>Lượt nộp</th><th>Ngày tạo</th>{isAdmin && <th></th>}
          </tr>
        </thead>
        <tbody>
          {fees.map((f) => (
            <tr key={f.id}>
              <td><strong>{f.name}</strong>{f.description && <div className="muted small">{f.description}</div>}</td>
              <td><span className={`tag ${f.category}`}>{categoryLabel(f.category)}</span></td>
              <td>{formatVND(f.amount)}</td>
              <td>{f.period || '-'}</td>
              <td>{formatVND(f.total_collected)}</td>
              <td>{f.payment_count}</td>
              <td className="small">{formatDate(f.created_at)}</td>
              {isAdmin && <td><button className="btn-link danger" onClick={() => remove(f.id)}>Xóa</button></td>}
            </tr>
          ))}
          {fees.length === 0 && (
            <tr><td colSpan={isAdmin ? 8 : 7} className="muted center">Chưa có khoản thu nào.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
