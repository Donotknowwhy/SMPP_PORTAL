function ComingSoon({ title, description }) {
  return (
    <div className="feature-developing">
      <div className="feature-developing-icon">🚧</div>
      <h2 className="feature-developing-title">{title}</h2>
      <p className="feature-developing-text">{description || 'Tính năng đang phát triển. Vui lòng quay lại sau.'}</p>
    </div>
  )
}

export default ComingSoon
