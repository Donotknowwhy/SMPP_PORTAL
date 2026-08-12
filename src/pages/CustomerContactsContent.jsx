import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Search, Plus, FileSpreadsheet, Pencil, Trash2, CheckSquare } from 'lucide-react'
import { CONTACT_GROUPS } from '../constants/customerPortal'

const NAME_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q']
const TAGS = ['Đơn hàng #DH001', 'Đơn hàng #DH002', 'Đơn hàng #DH003', 'Đơn hàng #DH005', 'Đơn hàng #DH008', null]

function generateMockContacts(group, count) {
  return Array.from({ length: count }, (_, i) => {
    const letter = NAME_LETTERS[i % NAME_LETTERS.length]
    return {
      id: `${group.id}-${i}`,
      phone: `${group.phonePrefix.slice(0, 8)}${String(i).padStart(2, '0')}`,
      name: `Nguyễn Văn ${letter}`,
      tag: TAGS[i % TAGS.length],
      status: i > 0 && i % 9 === 0 ? 'inactive' : 'active',
      addedAt: '24/05/2026',
    }
  })
}

const PAGE_SIZE_OPTIONS = [10, 20, 50]

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1])
  return Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)
}

function CustomerContactsContent() {
  const [selectedGroupId, setSelectedGroupId] = useState(CONTACT_GROUPS[0].id)
  const [groupSearch, setGroupSearch] = useState('')
  const [contactSearch, setContactSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [selectedContacts, setSelectedContacts] = useState([])

  const selectedGroup = useMemo(
    () => CONTACT_GROUPS.find((g) => g.id === selectedGroupId) || CONTACT_GROUPS[0],
    [selectedGroupId],
  )

  const filteredGroups = useMemo(() => {
    const keyword = groupSearch.trim().toLowerCase()
    if (!keyword) return CONTACT_GROUPS
    return CONTACT_GROUPS.filter((g) => g.name.toLowerCase().includes(keyword))
  }, [groupSearch])

  const allContacts = useMemo(
    () => generateMockContacts(selectedGroup, Math.min(selectedGroup.count, 47)),
    [selectedGroup],
  )

  const filteredContacts = useMemo(() => {
    const keyword = contactSearch.trim().toLowerCase()
    if (!keyword) return allContacts
    return allContacts.filter(
      (c) => c.phone.includes(keyword) || c.name.toLowerCase().includes(keyword),
    )
  }, [allContacts, contactSearch])

  const totalRows = filteredContacts.length
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageRows = filteredContacts.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const pageNumbers = buildPageNumbers(currentPage, totalPages)

  const handleSelectGroup = (id) => {
    setSelectedGroupId(id)
    setSelectedContacts([])
    setPage(1)
    setContactSearch('')
  }

  const allPageChecked = pageRows.length > 0 && pageRows.every((c) => selectedContacts.includes(c.id))

  const toggleAllOnPage = () => {
    if (allPageChecked) {
      setSelectedContacts((prev) => prev.filter((id) => !pageRows.some((r) => r.id === id)))
    } else {
      setSelectedContacts((prev) => Array.from(new Set([...prev, ...pageRows.map((r) => r.id)])))
    }
  }

  const toggleContact = (id) => {
    setSelectedContacts((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const handleRemoveSelected = () => {
    toast.success(`Đã xóa ${selectedContacts.length} liên hệ khỏi danh bạ.`)
    setSelectedContacts([])
  }

  const handleCreateGroup = () => {
    toast.info('Chức năng tạo nhóm danh bạ đang được phát triển.')
  }

  const handleImportExcel = () => {
    toast.info('Chức năng import Excel đang được phát triển.')
  }

  const handleAddPhone = () => {
    toast.info('Chức năng thêm số điện thoại đang được phát triển.')
  }

  return (
    <div className="cdb-page">
      <h2 className="cdb-page-title">Quản lý danh bạ &amp; khách hàng</h2>

      <div className="cdb-layout">
        {/* Groups panel */}
        <div className="gw-card cdb-groups-panel">
          <div className="cdb-groups-head">
            <h3 className="cc-section-title">Nhóm danh bạ</h3>
            <button className="db-export-btn gw-save-btn" onClick={handleCreateGroup}>
              <Plus size={15} /> Tạo nhóm
            </button>
          </div>

          <div className="pm-search-field cdb-group-search">
            <input
              type="text"
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
              placeholder="Tìm kiếm"
            />
            <Search size={16} className="pm-search-icon" />
          </div>

          <div className="cdb-group-list">
            {filteredGroups.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`cdb-group-item${g.id === selectedGroupId ? ' active' : ''}`}
                onClick={() => handleSelectGroup(g.id)}
              >
                <div className="cdb-group-item-text">
                  <span className="cdb-group-name">{g.name}</span>
                  <span className="cdb-group-updated">Cập nhật {g.updatedAt}</span>
                </div>
                <span className="cdb-group-count">{new Intl.NumberFormat('vi-VN').format(g.count)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contacts panel */}
        <div className="gw-card cdb-contacts-panel">
          <div className="cdb-contacts-head">
            <div>
              <h3 className="cc-section-title">{selectedGroup.name}</h3>
              <p className="cdb-contacts-subtitle">
                Tổng số: {new Intl.NumberFormat('vi-VN').format(selectedGroup.count)} liên hệ
              </p>
            </div>
            <div className="cdb-contacts-actions">
              <div className="pm-search-field cdb-contact-search">
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => { setContactSearch(e.target.value); setPage(1) }}
                  placeholder="Tìm kiếm"
                />
                <Search size={16} className="pm-search-icon" />
              </div>
              <button className="db-export-btn cd-excel-btn" onClick={handleImportExcel}>
                <FileSpreadsheet size={15} /> Import Excel
              </button>
              <button className="db-export-btn gw-save-btn" onClick={handleAddPhone}>
                <Plus size={15} /> Thêm SĐT
              </button>
            </div>
          </div>

          <div className="cdb-selection-bar">
            <span className="cdb-selection-count">
              <CheckSquare size={14} /> Đã chọn {selectedContacts.length} liên hệ
            </span>
            <button
              type="button"
              className="cdb-remove-link"
              disabled={selectedContacts.length === 0}
              onClick={handleRemoveSelected}
            >
              <Trash2 size={14} /> Xóa khỏi danh bạ
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="routing-table cdb-table">
              <thead>
                <tr>
                  <th className="cca-checkbox-col">
                    <input type="checkbox" checked={allPageChecked} onChange={toggleAllOnPage} />
                  </th>
                  <th>Số điện thoại</th>
                  <th>Họ và tên (Biệt danh)</th>
                  <th>Tham số khác</th>
                  <th>Trạng thái</th>
                  <th>Ngày thêm</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="gw-table-status">Không có liên hệ phù hợp.</td>
                  </tr>
                )}
                {pageRows.map((c) => (
                  <tr key={c.id}>
                    <td className="cca-checkbox-col">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(c.id)}
                        onChange={() => toggleContact(c.id)}
                      />
                    </td>
                    <td>{c.phone}</td>
                    <td>{c.name}</td>
                    <td>{c.tag || '--'}</td>
                    <td>
                      <span className={`cdb-status cdb-status-${c.status}`}>
                        <span className="status-dot" /> {c.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}
                      </span>
                    </td>
                    <td>{c.addedAt}</td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn" title="Sửa"><Pencil size={14} /></button>
                        <button className="action-btn delete" title="Xóa"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cdb-pagination">
            <div className="cdb-page-size">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
              >
                {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span>Row</span>
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                ‹
              </button>
              {pageNumbers.map((p, idx) => (
                <span key={p} style={{ display: 'contents' }}>
                  {idx > 0 && pageNumbers[idx - 1] !== p - 1 && <span className="cdb-page-ellipsis">…</span>}
                  <button
                    className={`pagination-btn${p === currentPage ? ' active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                </span>
              ))}
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setPage(currentPage + 1)}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerContactsContent
