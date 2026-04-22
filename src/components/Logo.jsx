export default function Logo({ size = 'md', showSubtitle = false, light = false, tenantName = null }) {
  const cfg = {
    sm: { icon: 28, title: 16, sub: 9,  gap: 8,  stroke: 1.5 },
    md: { icon: 38, title: 22, sub: 11, gap: 10, stroke: 2   },
    lg: { icon: 52, title: 30, sub: 13, gap: 14, stroke: 2.5 },
  }
  const { icon, title, sub, gap, stroke } = cfg[size]
  const textColor = light ? '#1E3A8A' : '#F1F5F9'
  const subColor  = light ? '#3B82F6' : '#64748B'

  const displayName = tenantName || 'PAAB'
  const nameLen = displayName.length
  const dynamicSize = tenantName
    ? nameLen > 12 ? Math.max(title - 8, 12)
    : nameLen > 8  ? title - 4
    : title
    : title

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap, minWidth: 0 }}>
      <svg width={icon} height={icon} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <rect x="1.5" y="1.5" width="37" height="37" rx="9" fill="rgba(59,130,246,0.15)" stroke="#3B82F6" strokeWidth={stroke} />
        <line x1="8" y1="10" x2="32" y2="10" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="8" y1="14" x2="26" y2="14" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <text x="20" y="31" textAnchor="middle" fill="#60A5FA" fontSize="11.5" fontFamily="monospace" fontWeight="700">&lt;/&gt;</text>
      </svg>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: dynamicSize,
          fontWeight: 800,
          letterSpacing: tenantName ? '0.5px' : '3px',
          color: textColor,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {displayName}
        </div>
        {tenantName ? (
          <div style={{ fontSize: sub, color: subColor, marginTop: 3, letterSpacing: '0.2px' }}>
            PAAB Group bünyesindedir
          </div>
        ) : showSubtitle ? (
          <div style={{ fontSize: sub, color: subColor, marginTop: 3, letterSpacing: '0.3px' }}>
            Powerful Applications & Advanced Backend
          </div>
        ) : null}
      </div>
    </div>
  )
}
