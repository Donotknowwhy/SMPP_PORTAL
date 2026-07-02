export const NETWORKS = ['VTL', 'Vina', 'MBF', 'VNM', 'GTel']

export const PRICE_ROWS = [
  {
    id: 1,
    brandname: 'GPAY',
    partner: 'ST',
    type: 'OTP',
    prices: { VTL: [320, 300], Vina: [300, 300], MBF: [300, 300], VNM: [300, 300], GTel: [300, 300] },
    status: 'active',
    updated: '26/05/2026',
    updatedBy: 'admin_sr...',
  },
  {
    id: 2,
    brandname: 'JOY',
    partner: 'Gapit',
    type: 'CSKH',
    prices: { VTL: [360, 390], Vina: [390, 390], MBF: [390, 390], VNM: [390, 390], GTel: [390, 390] },
    status: 'draft',
    updated: '26/05/2026',
    updatedBy: 'pricing_t...',
  },
]

export const HISTORY_ITEMS = [
  {
    id: 1,
    color: 'orange',
    title: 'ST - OTP - Viettel',
    oldPrice: 320,
    newPrice: 330,
    diff: 10,
    diffPct: 3.13,
    up: true,
    updatedBy: 'admin_sms',
    oldRange: { from: '21/06/2026', to: '21/06/2026', days: 36 },
    newRange: { from: '21/06/2026', to: '21/06/2026', days: 32 },
    time: '21/06/2026 11:30',
  },
  {
    id: 2,
    color: 'green',
    title: 'Gapit - CSKH - MobiFone',
    oldPrice: 375,
    newPrice: 330,
    diff: 13,
    diffPct: 3.47,
    up: true,
    updatedBy: 'pricing_team',
    oldRange: { from: '21/06/2026', to: '21/06/2026', days: 6 },
    newRange: { from: '21/06/2026', to: '21/06/2026', days: 6 },
    time: '21/06/2026 16:30',
  },
]
