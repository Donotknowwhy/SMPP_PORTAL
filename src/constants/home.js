import iconSms from '../assets/icons/icon-park-outline_city.svg'
import iconSuccessRate from '../assets/icons/icon-park-outline_city (1).svg'
import iconRevenue from '../assets/icons/icon-park-outline_city (2).svg'
import iconFailed from '../assets/icons/icon-park-outline_city (3).svg'
import iconProfit from '../assets/icons/icon-park-outline_city (4).svg'

export const STATS = [
  { id: 1, icon: iconSms, label: 'Tổng SMS', value: '12.584.220', trend: '12.3% so với hôm qua', trendType: 'up', highlighted: true },
  { id: 2, icon: iconSuccessRate, label: 'tỷ lệ thành công', value: '98.7%', trend: '0.6% so với hôm qua', trendType: 'up' },
  { id: 3, icon: iconRevenue, label: 'Doanh thu', value: '1.258 VND', trend: 'Cập nhật realtime', trendType: 'realtime' },
  { id: 4, icon: iconFailed, label: 'Tin nhắn thất bại', value: '1.842', trend: 'Trong ngưỡng an toàn', trendType: 'neutral' },
  { id: 5, icon: iconProfit, label: 'Tổng lợi nhuận', value: '5.000', trend: '0.9% so với hôm qua', trendType: 'up', highlighted: true },
]

export const TRAFFIC_DATA = [
  { label: 'VTP', ST: 2.5, VNPAY: 0.3, GAPIT: 1.6 },
  { label: 'VNP', ST: 2.0, VNPAY: 2.7, GAPIT: 2.0 },
  { label: 'VNM', ST: 2.2, VNPAY: 1.5, GAPIT: 0.1 },
  { label: 'GTEL', ST: 2.2, VNPAY: 1.8, GAPIT: 1.8 },
  { label: 'MBF', ST: 3.2, VNPAY: 0.3, GAPIT: 0.8 },
]
export const TRAFFIC_MAX = 4
export const SERIES_COLORS = { ST: '#16A34A', VNPAY: '#2563EB', GAPIT: '#F59E0B' }

export const DELIVERY_SEGMENTS = [
  { label: 'Thành công', pct: 72.4, value: '9,103,240', color: '#16A34A' },
  { label: 'Thất bại', pct: 3.8, value: '103,240', color: '#E31E24' },
  { label: 'Đang xử lý', pct: 8.2, value: '1,103,240', color: '#FDBA74' },
  { label: 'Chờ gửi', pct: 15.6, value: '1,803,240', color: '#FACC15' },
]

export const REPORT_ROWS = [
  { date: '26/06/2026', customer: 'Thanh Store', brandname: 'THANH_STORE', route: 'Viettel', routeColor: 'red', network: 'Viettel', networkSub: 'Tin CSKH', total: '31,500', success: '31,500', fail: '500', buy: '320 đ', sell: '500 đ', profit: '+5,670,000 đ' },
  { date: '26/06/2026', customer: 'Quang Store', brandname: 'QUANG_STORE', route: 'VNPT', routeColor: 'blue', network: 'VNPT', networkSub: 'Tin CSKH', total: '12,600', success: '12,600', fail: '100', buy: '350 đ', sell: '520 đ', profit: '+4,670,000 đ' },
  { date: '26/06/2026', customer: 'Cty thời trang', brandname: 'FASHION_X', route: 'Mobifone', routeColor: 'orange', network: 'Mobifone', networkSub: 'Tin quảng cáo', total: '100,000', success: '100,000', fail: '4,000', buy: '450 đ', sell: '705 đ', profit: '+23,670,000 đ' },
]
