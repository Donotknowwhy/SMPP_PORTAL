import { useState } from 'react'
import wifiAntennaIcon from '../assets/icons/streamline_wifi-antenna.svg'
import shieldTickIcon from '../assets/icons/shield-tick.svg'
import shieldZapIcon from '../assets/icons/shield-zap.svg'
import fileShieldIcon from '../assets/icons/file-shield-02.svg'
import editIcon from '../assets/icons/tabler_edit.svg'
import deleteIcon from '../assets/icons/fluent_delete-24-regular.svg'

function RoutingRulesContent() {
  const [network, setNetwork] = useState('SkyFi')
  const [primaryProvider, setPrimaryProvider] = useState('ST')
  const [backupProvider, setBackupProvider] = useState('Gapit')
  const [condition, setCondition] = useState('Fail Rate > 10%')

  const rules = [
    {
      id: 1,
      network: 'Viettel',
      primaryProvider: 'ST',
      backupProvider: 'Gapit',
      rule: 'Queue > 5000 auto switch',
      status: 'active'
    },
    {
      id: 2,
      network: 'Mobifone',
      primaryProvider: 'VNPAY',
      backupProvider: 'ST',
      rule: 'Timeout > 5s',
      status: 'active'
    }
  ]

  return (
    <div className="routing-rules-content">
      <div className="routing-header">
        <h1 className="routing-title">Portal quản trị</h1>
      </div>

      <div className="routing-filters">
        <div className="filter-group">
          <label className="filter-label">
            <img src={wifiAntennaIcon} alt="Nhà mạng" className="filter-icon" />
            Nhà mạng
          </label>
          <select className="filter-select" value={network} onChange={(e) => setNetwork(e.target.value)}>
            <option value="SkyFi">SkyFi</option>
            <option value="Viettel">Viettel</option>
            <option value="Mobifone">Mobifone</option>
            <option value="Vinaphone">Vinaphone</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <img src={shieldTickIcon} alt="Provider chính" className="filter-icon" />
            Provider chính
          </label>
          <select className="filter-select" value={primaryProvider} onChange={(e) => setPrimaryProvider(e.target.value)}>
            <option value="ST">ST</option>
            <option value="VNPAY">VNPAY</option>
            <option value="Gapit">Gapit</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <img src={shieldZapIcon} alt="Provider backup" className="filter-icon" />
            Provider backup
          </label>
          <select className="filter-select" value={backupProvider} onChange={(e) => setBackupProvider(e.target.value)}>
            <option value="Gapit">Gapit</option>
            <option value="ST">ST</option>
            <option value="VNPAY">VNPAY</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <img src={fileShieldIcon} alt="Điều kiện chuyển hướng" className="filter-icon" />
            Điều kiện chuyển hướng
          </label>
          <select className="filter-select" value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="Fail Rate > 10%">Fail Rate &gt; 10%</option>
            <option value="Fail Rate > 20%">Fail Rate &gt; 20%</option>
            <option value="Timeout > 5s">Timeout &gt; 5s</option>
          </select>
        </div>
      </div>

      <div className="routing-table-section">
        <div className="routing-table-header">
          <span className="table-icon">📋</span>
          <h3 className="table-title">Danh sách Rule</h3>
        </div>

        <table className="routing-table">
          <thead>
            <tr>
              <th>Nhà mạng</th>
              <th>Provider A (Chính)</th>
              <th>Provider B (Backup)</th>
              <th>Rule</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id}>
                <td>
                  <span className="table-network">{rule.network}</span>
                </td>
                <td>
                  <span className="table-provider primary">{rule.primaryProvider}</span>
                </td>
                <td>
                  <span className="table-provider backup">{rule.backupProvider}</span>
                </td>
                <td>{rule.rule}</td>
                <td>
                  <span className="status-badge active">
                    <span className="status-dot" />
                    Active
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="action-btn edit" title="Chỉnh sửa">
                      <img src={editIcon} alt="Chỉnh sửa" width="20" height="20" />
                    </button>
                    <button className="action-btn delete" title="Xóa">
                      <img src={deleteIcon} alt="Xóa" width="20" height="20" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="routing-pagination">
          <span className="pagination-info">Hiển thị 1 - 2 của 2</span>
          <div className="pagination-controls">
            <button className="pagination-btn" disabled>‹</button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn" disabled>›</button>
          </div>
          <select className="pagination-select">
            <option value="10">10/trang</option>
            <option value="20">20/trang</option>
            <option value="50">50/trang</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default RoutingRulesContent
