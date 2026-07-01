import { useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { FileUpload } from 'primereact/fileupload'
import { Button } from 'primereact/button'
import { IdCard, CloudUpload, FileArchive, Info, Save, Send } from 'lucide-react'

const BRANDNAME_TYPES = [
  { label: 'Doanh nghiệp', value: 'doanh-nghiep' },
  { label: 'Cá nhân', value: 'ca-nhan' },
  { label: 'Cơ quan nhà nước', value: 'co-quan-nha-nuoc' },
]

function BrandnameDeclarationContent() {
  const [form, setForm] = useState({
    name: '',
    type: null,
    business: null,
    taxCode: '',
    phone: null,
    email: '',
  })
  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const headerTemplate = (options) => (
    <div className="bn-upload-static">
      <span className="bn-upload-cloud-icon">
        <CloudUpload size={22} />
      </span>
      <p className="bn-upload-title">Kém thả hoặc chọn tệp để upload</p>
      <p className="bn-upload-hint">Hồ sơ: PDF,DOCX,PNG,JPG,ZIP,RAR</p>
      <p className="bn-upload-hint">Tối đa: 20MB</p>
      <div className="bn-upload-header">{options.chooseButton}</div>
    </div>
  )

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

      <div className="gw-card bn-upload-card">
        <FileUpload
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
          label="Đăng ký Brandname"
          icon={() => <Send size={16} />}
          className="bn-btn-submit"
        />
      </div>
    </div>
  )
}

export default BrandnameDeclarationContent
