import { useEffect, useRef, useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { FileUpload } from 'primereact/fileupload'
import { Button } from 'primereact/button'
import { toast } from 'react-toastify'
import { IdCard, CloudUpload, FileArchive, Info, Save, Send } from 'lucide-react'
import { BRANDNAME_TYPES } from '../constants/brandnameDeclaration'
import { useAuth } from '../context/AuthContext'
import { getRoutingInfo } from '../utils/routingApi'
import { createBrandname } from '../utils/brandnameApi'

const DEFAULT_FORM = {
  name: '',
  type: null,
  business: null,
  taxCode: '',
  phone: null,
  email: '',
  providerId: null,
}

function BrandnameDeclarationContent() {
  const { authToken } = useAuth()
  const [form, setForm] = useState(DEFAULT_FORM)
  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))
  const fileUploadRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [providerOptions, setProviderOptions] = useState([])
  const [infoError, setInfoError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authToken) return

    let cancelled = false
    setInfoError('')

    getRoutingInfo(authToken)
      .then(({ providers }) => {
        if (cancelled) return
        setProviderOptions(providers.map((p) => ({ label: p.providerName, value: p.id })))
      })
      .catch((err) => {
        if (!cancelled) setInfoError(err.message || 'Không tải được danh sách đối tác.')
      })

    return () => {
      cancelled = true
    }
  }, [authToken])

  const handleSubmit = () => {
    if (!authToken) return
    if (!form.name || !form.providerId) {
      toast.warn('Vui lòng nhập tên Brandname và chọn đối tác.')
      return
    }

    setSubmitting(true)

    createBrandname({
      token: authToken,
      brandName: form.name,
      providerId: form.providerId,
      type: form.type,
      business: form.business,
      taxCode: form.taxCode,
      phone: form.phone,
      email: form.email,
    })
      .then((message) => {
        toast.success(message || 'Tạo cấu hình brandname thành công.')
        setForm(DEFAULT_FORM)
        fileUploadRef.current?.clear()
      })
      .catch((err) => {
        toast.error(err.message || 'Không tạo được cấu hình brandname.')
      })
      .finally(() => setSubmitting(false))
  }

  const headerTemplate = (options) => (
    <div className="bn-upload-static">
      <span className="bn-upload-cloud-icon">
        <CloudUpload size={22} />
      </span>
      <p className="bn-upload-title">Kéo thả hoặc chọn tệp để upload</p>
      <p className="bn-upload-hint">Hồ sơ: PDF,DOCX,PNG,JPG,ZIP,RAR</p>
      <p className="bn-upload-hint">Tối đa: 20MB</p>
      <div className="bn-upload-header">{options.chooseButton}</div>
    </div>
  )

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const input = fileUploadRef.current?.getInput()
    if (!input || !e.dataTransfer?.files?.length) return

    const dataTransfer = new DataTransfer()
    Array.from(e.dataTransfer.files).forEach((file) => dataTransfer.items.add(file))
    input.files = dataTransfer.files
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }

  const itemTemplate = (file, options) => (
    <div className="bn-file-item">
      <span className="bn-file-icon">
        <FileArchive size={20} />
      </span>
      <div className="bn-file-info">
        <span className="bn-file-name">{file.name}</span>
        <span className="bn-file-size">{options.formatSize}</span>
      </div>
      <button className="bn-file-remove" onClick={options.onRemove} aria-label="Xóa tệp">
        ×
      </button>
    </div>
  )

  return (
    <div className="bn-declaration-content">
      <div className="gw-card">
        <div className="gw-card-head">
          <span className="gw-card-icon">
            <IdCard size={18} />
          </span>
          <h2 className="gw-card-title">Thông tin Brandname</h2>
        </div>

        {infoError && <p className="gw-table-error">{infoError}</p>}

        <div className="bn-form-grid">
          <div className="gw-form-field">
            <label>Tên Brandname <span className="gw-required">*</span></label>
            <InputText
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="Nhập tên brandname"
            />
          </div>
          <div className="gw-form-field">
            <label>Đối tác <span className="gw-required">*</span></label>
            <Dropdown
              value={form.providerId}
              onChange={(e) => updateForm('providerId', e.value)}
              options={providerOptions}
              placeholder="Chọn đối tác"
              className="bn-dropdown"
            />
          </div>
          <div className="gw-form-field">
            <label>Loại Brandname</label>
            <Dropdown
              value={form.type}
              onChange={(e) => updateForm('type', e.value)}
              options={BRANDNAME_TYPES}
              placeholder="Chọn loại Brandname"
              className="bn-dropdown"
            />
          </div>

          <div className="gw-form-field">
            <label>Doanh nghiệp</label>
            <InputText
              value={form.business || ''}
              onChange={(e) => updateForm('business', e.target.value)}
              placeholder="Nhập tên doanh nghiệp"
            />
          </div>
          <div className="gw-form-field">
            <label>Mã số thuế</label>
            <InputText
              value={form.taxCode}
              onChange={(e) => updateForm('taxCode', e.target.value)}
              placeholder="Nhập mã số thuế"
            />
          </div>

          <div className="gw-form-field">
            <label>Số điện thoại</label>
            <InputText
              value={form.phone || ''}
              onChange={(e) => updateForm('phone', e.target.value)}
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div className="gw-form-field">
            <label>Email</label>
            <InputText
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              placeholder="Nhập email"
            />
          </div>
        </div>
      </div>

      <div
        className={`gw-card bn-upload-card${isDragging ? ' bn-upload-card-dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FileUpload
          ref={fileUploadRef}
          name="brandnameFiles[]"
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.rar"
          maxFileSize={20 * 1024 * 1024}
          customUpload
          uploadHandler={() => {}}
          chooseLabel="Chọn tệp"
          className="bn-fileupload"
          headerTemplate={headerTemplate}
          itemTemplate={itemTemplate}
        />

        <div className="bn-upload-note">
          <Info size={14} /> Bạn có thể chọn nhiều file cùng lúc
        </div>
      </div>

      <div className="bn-form-actions">
        <Button
          label="Lưu nháp"
          icon={() => <Save size={16} />}
          className="bn-btn-draft"
          outlined
        />
        <Button
          label={submitting ? 'Đang gửi...' : 'Đăng ký Brandname'}
          icon={() => <Send size={16} />}
          className="bn-btn-submit"
          onClick={handleSubmit}
          disabled={submitting}
        />
      </div>
    </div>
  )
}

export default BrandnameDeclarationContent
