const toOptions = (values) => values.map((v) => ({ label: v, value: v }))

export const BRANDNAMES = toOptions(['GPAY', 'JOY'])
export const NETWORKS = toOptions(['Tất cả', 'Viettel', 'Mobifone', 'Vinaphone'])
export const PROVIDERS = toOptions(['ST', 'MobiOne', 'Gapit', 'VNPAY'])
export const STATUSES = [
  { label: 'Đang hoạt động – Mặc định', value: 'MANUAL_ACTIVE' },
  { label: 'Đang hoạt động – Theo giá', value: 'PRICE_ACTIVE' },
  { label: 'Ngừng hoạt động', value: 'INACTIVE' },
]
export const PRIORITIES = toOptions([1, 2, 3, 4, 5])
export const NETWORK_FILTER_OPTIONS = toOptions(['Tất cả', 'Viettel', 'Mobifone', 'Vinaphone'])

