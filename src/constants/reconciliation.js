import { MessageCircle, FileText, Building2, TrendingDown } from 'lucide-react'

export const STATUS_OPTIONS = [
  { label: 'Tất cả', value: null },
  { label: 'Need Review', value: 'NEED_REVIEW' },
  { label: 'Verified', value: 'VERIFIED' },
]

export const STATS_CONFIG = [
  { id: 1, icon: MessageCircle, color: '#2563EB', label: 'Tổng SMS', unit: 'Tin nhắn', key: 'totalSms' },
  { id: 2, icon: FileText, color: '#16A34A', label: 'Tổng doanh thu', unit: 'VND', key: 'totalPrice' },
  { id: 3, icon: Building2, color: '#2563EB', label: 'Tổng chi phí NCC', unit: 'VND', key: 'totalCost' },
  { id: 4, icon: TrendingDown, color: '#E31E24', label: 'Lợi nhuận', unit: 'VND', key: 'profit' },
]
