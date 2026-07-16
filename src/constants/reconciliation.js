import { MessageCircle, FileText, Building2, TrendingDown } from 'lucide-react'

export const BULK_STATUS_OPTIONS = [
  { label: 'Cập nhật trạng thái', value: '' },
  { label: 'Đã đối soát', value: 'reconciled' },
  { label: 'Chưa đối soát', value: 'pending' },
  { label: 'Tạm dừng', value: 'paused' },
]

export const NETWORK_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Viettel', value: 'viettel' },
  { label: 'Mobifone', value: 'mobifone' },
  { label: 'Vinaphone', value: 'vinaphone' },
]

export const BRANDNAME_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'GPAY', value: 'GPAY' },
  { label: 'JOY', value: 'JOY' },
  { label: 'VNPAY', value: 'VNPAY' },
]

export const PARTNER_OPTIONS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'ST', value: 'ST' },
  { label: 'Gapit', value: 'Gapit' },
  { label: 'VNPAY', value: 'VNPAY' },
]

export const STATUS_OPTIONS = [
  { label: 'Tất cả', value: '' },
  { label: 'Verified', value: 'verified' },
  { label: 'Need Review', value: 'review' },
]

export const STATS_CONFIG = [
  { id: 1, icon: MessageCircle, color: '#2563EB', label: 'Tổng SMS', unit: 'Tin nhắn', key: 'totalSms' },
  { id: 2, icon: FileText, color: '#16A34A', label: 'Tổng doanh thu', unit: 'VND', key: 'totalPrice' },
  { id: 3, icon: Building2, color: '#2563EB', label: 'Tổng chi phí NCC', unit: 'VND', key: 'totalCost' },
  { id: 4, icon: TrendingDown, color: '#E31E24', label: 'Lợi nhuận', unit: 'VND', key: 'profit' },
]

export const RECON_ROWS = [
  {
    id: 1,
    from: '02/06/2026', to: '02/06/2026', customer: 'GPAY', brandname: 'GPAY', network: 'Viettel', partner: 'ST',
    volume: '120,000', buyPrice: '119,850 đ', sellPrice: '240 đ', revenue: '38,400,000 đ', cost: '38,250,000 đ',
    profit: '+150,000 đ', profitUp: true, status: 'verified',
  },
  {
    id: 2,
    from: '02/06/2026', to: '02/06/2026', customer: 'JOY', brandname: 'JOY', network: 'Mobifone', partner: 'Gapit',
    volume: '85,000', buyPrice: '84,700 đ', sellPrice: '310 đ', revenue: '26,350,000 đ', cost: '26,350,300 đ',
    profit: '-300 đ', profitUp: false, status: 'review',
  },
  {
    id: 3,
    from: '02/06/2026', to: '02/06/2026', customer: 'VNPAY', brandname: 'VNPAY', network: 'Vinaphone', partner: 'VNPAY',
    volume: '255,000', buyPrice: '253,000 đ', sellPrice: '310 đ', revenue: '76,800,000 đ', cost: '77,400,000 đ',
    profit: '-600,000 đ', profitUp: false, status: 'verified',
  },
]

export const HISTORY_ROWS = [
  { id: 1, time: '02/06/2026 10:08', user: 'Finance_admin', action: 'Upload file đối soát NCC', file: 'ST_248565152.xlsx', result: 'success', note: 'Upload thành công' },
  { id: 2, time: '02/06/2026 09:05', user: 'Operation_team', action: 'Import báo cáo khách hàng', file: 'GPAY_248565152.xlsx', result: 'success', note: 'Import thành công' },
  { id: 3, time: '02/06/2026 08:05', user: 'admin_team', action: 'Review lệch sản lượng', file: 'GPAY_248565152.xlsx', result: 'review', note: 'Chênh lệch > 0.5%' },
  { id: 4, time: '02/06/2026 11:05', user: 'Operation_team', action: 'Chạy lại đối soát', file: '-', result: 'success', note: 'Re-Run thành công' },
]
