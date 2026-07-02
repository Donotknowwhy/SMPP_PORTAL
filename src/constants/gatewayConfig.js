const toOptions = (values) => values.map((v) => ({ label: v, value: v }))

export const BRANDNAMES = toOptions(['GPAY', 'JOY'])
export const NETWORKS = toOptions(['Tất cả', 'Viettel', 'Mobifone', 'Vinaphone'])
export const PROVIDERS = toOptions(['ST', 'MobiOne', 'Gapit', 'VNPAY'])
export const STATUSES = toOptions(['Active', 'Inactive'])
export const PRIORITIES = toOptions([1, 2, 3, 4, 5])
export const NETWORK_FILTER_OPTIONS = toOptions(['Tất cả', 'Viettel', 'Mobifone', 'Vinaphone'])

export const ROUTING_ROWS = [
  {
    id: 1,
    brandname: 'GPAY',
    network: 'Viettel',
    primary: 'ST',
    backup: 'Gapit',
    tps: 1000,
    priority: 1,
    status: 'active',
    updated: '26/06/2026 10:30',
    updatedBy: 'admin_sms',
  },
  {
    id: 2,
    brandname: 'JOY',
    network: 'Mobifone',
    primary: 'MobiOne',
    backup: 'ST',
    tps: 500,
    priority: 1,
    status: 'active',
    updated: '26/06/2026 09:30',
    updatedBy: 'operation_team',
  },
]

export const HISTORY_ITEMS = [
  {
    id: 1,
    title: 'GPAY - Viettel',
    changes: [
      { label: 'Provider chính', from: 'ST', to: 'ST', unchanged: true },
      { label: 'TPS (tin/giây)', from: '800', to: '1000' },
      { label: 'Provider dự phòng', from: 'Gapit', to: 'Gapit', unchanged: true },
      { label: 'Priority', from: '2', to: '1' },
    ],
    reason: 'Tăng tải chiến dịch',
    date: '26/06/2026 10:30',
    user: 'admin_sms',
  },
  {
    id: 2,
    title: 'JOY - Mobifone',
    changes: [
      { label: 'TPS (tin/giây)', from: '300', to: '500' },
      { label: 'Provider dự phòng', from: '-', to: 'Gapit' },
    ],
    reason: 'Fail rate > 10%',
    date: '26/06/2026 10:30',
    user: 'admin_sms',
  },
]
