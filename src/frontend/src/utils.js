export const formatVND = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0)

export const formatDate = (s) => {
  if (!s) return '-'
  const d = new Date(s)
  return d.toLocaleString('vi-VN')
}

export const categoryLabel = (c) =>
  c === 'mandatory' ? 'Bắt buộc' : 'Tự nguyện'
