import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import client from '../api/client'

export default function AdminDashboard({ user, onLogout, tenantName }) {
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const buildingId = user.building_id || 1

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':   return <DashboardContent buildingId={buildingId} />
      case 'aidatlar':    return <AidatlarContent buildingId={buildingId} />
      case 'daireler':    return <DairelerContent buildingId={buildingId} />
      case 'duyurular':   return <DuyurularContent buildingId={buildingId} />
      case 'arizalar':    return <ArizalarContent buildingId={buildingId} />
      case 'giderler':    return <GiderlerContent buildingId={buildingId} />
      case 'kullanicilar':return <KullanicilarContent buildingId={buildingId} />
      case 'bakim':       return <BakimContent buildingId={buildingId} />
      case 'belgeler':    return <BelgelerContent buildingId={buildingId} isAdmin />
      case 'anket':       return <AnketContent buildingId={buildingId} user={user} isAdmin />
      case 'rezervasyon': return <RezervasyonContent buildingId={buildingId} user={user} isAdmin />
      case 'ziyaretci':   return <ZiyaretciContent buildingId={buildingId} isAdmin />
      case 'personel':    return <PersonelContent buildingId={buildingId} />
      case 'mesajlar':    return <MesajlarContent buildingId={buildingId} user={user} isAdmin />
      case 'raporlar':    return <RaporlarContent buildingId={buildingId} />
      default: return <DashboardContent buildingId={buildingId} />
    }
  }

  const titles = {
    dashboard: 'Genel Bakış', aidatlar: 'Aidat Yönetimi', daireler: 'Daireler',
    duyurular: 'Duyurular', arizalar: 'Arıza Takibi', giderler: 'Gider Yönetimi',
    kullanicilar: 'Kullanıcı Yönetimi', bakim: 'Bakım Takvimi', belgeler: 'Belgeler',
    anket: 'Anketler', rezervasyon: 'Ortak Alan Rezervasyonu', ziyaretci: 'Ziyaretçi Takibi',
    personel: 'Personel Yönetimi', mesajlar: 'Mesajlar', raporlar: 'Aylık Raporlar',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99 }} />
      )}
      <Sidebar
        role="admin"
        activePage={activePage}
        setActivePage={(page) => { setActivePage(page); setSidebarOpen(false) }}
        user={user}
        onLogout={onLogout}
        isMobile={isMobile}
        isOpen={sidebarOpen}
        tenantName={tenantName}
      />
      <main style={s.main}>
        <div style={s.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '22px', cursor: 'pointer', padding: '4px', lineHeight: 1 }}>
                ☰
              </button>
            )}
            <div>
              <h1 style={s.pageTitle}>{titles[activePage]}</h1>
              <p style={s.pageDate}>Bugün, {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
        <div style={s.content}>{renderContent()}</div>
      </main>
    </div>
  )
}

function useApi(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    setLoading(true)
    fn().then(r => setData(r.data)).catch(e => setError(e)).finally(() => setLoading(false))
  }, deps)
  return { data, loading, error }
}

function Spinner() {
  return <div style={{ padding: '60px', textAlign: 'center', color: '#475569' }}>Yükleniyor...</div>
}

function DashboardContent({ buildingId }) {
  const { data, loading } = useApi(() => client.get(`/api/dashboard/admin?building_id=${buildingId}`), [buildingId])
  const { data: payments, loading: pLoading } = useApi(() => client.get(`/api/payments?building_id=${buildingId}&period=${new Date().toISOString().slice(0,7)}`), [buildingId])

  if (loading || pLoading) return <Spinner />
  if (!data) return null

  const stats = [
    { label: 'Toplam Daire', value: data.apartments?.total || '0', icon: '⬡', color: '#3B82F6', sub: `${data.apartments?.occupied || 0} dolu` },
    { label: 'Tahsil Edilen', value: `₺${Number(data.payments?.collected || 0).toLocaleString('tr-TR')}`, icon: '₺', color: '#10B981', sub: 'Bu ay' },
    { label: 'Bekleyen Aidat', value: data.payments?.pending || '0', icon: '⏳', color: '#F59E0B', sub: 'Daire' },
    { label: 'Açık Arıza', value: data.repairs?.pending || '0', icon: '🔧', color: '#EF4444', sub: 'Bekliyor' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={s.statsGrid}>
        {stats.map(stat => (
          <div key={stat.label} style={s.statCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={s.statLabel}>{stat.label}</p>
                <p style={{ ...s.statValue, color: stat.color }}>{stat.value}</p>
                <p style={s.statSub}>{stat.sub}</p>
              </div>
              <div style={{ ...s.statIcon, background: `${stat.color}22`, color: stat.color }}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={s.twoCol}>
        <div style={s.card}>
          <h3 style={s.cardTitle}>Son Aidat Hareketleri</h3>
          <table style={s.table}>
            <thead><tr>{['Daire', 'Daire Sahibi', 'Tutar', 'Durum'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {(payments || []).slice(0, 5).map(row => (
                <tr key={row.id} style={s.tr}>
                  <td style={s.td}><span style={s.daireBadge}>{row.block ? `${row.block}-${row.unit_number}` : row.unit_number}</span></td>
                  <td style={s.td}>{row.owner_name || '-'}</td>
                  <td style={s.td}>₺{Number(row.amount).toLocaleString('tr-TR')}</td>
                  <td style={s.td}><StatusBadge durum={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={s.card}>
          <h3 style={s.cardTitle}>Son Duyurular</h3>
          {['genel', 'daire'].map(tip => {
            const liste = (data.recent_announcements || []).filter(d => tip === 'genel' ? !d.apartment_id : !!d.apartment_id)
            if (!liste.length) return null
            return (
              <div key={tip} style={{ marginBottom: '14px' }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: tip === 'genel' ? '#60A5FA' : '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  {tip === 'genel' ? '📢 Genel' : '🏠 Daire Bazlı'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {liste.map(d => (
                    <div key={d.id} style={s.duyuruItem}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={s.duyuruBaslik}>{d.title}</span>
                        <span style={s.duyuruTarih}>{new Date(d.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AidatlarContent({ buildingId }) {
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    client.get(`/api/payments?building_id=${buildingId}&period=${period}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [buildingId, period])

  const shiftMonth = (dir) => {
    const d = new Date(period + '-01')
    d.setMonth(d.getMonth() + dir)
    setPeriod(d.toISOString().slice(0, 7))
  }

  const rows = data || []
  const odendi   = rows.filter(r => r.status === 'ödendi')
  const bekliyor = rows.filter(r => r.status === 'bekliyor')
  const gecikm   = rows.filter(r => r.status === 'gecikmiş')
  const toplam   = odendi.reduce((s, r) => s + Number(r.amount), 0)

  const [y, m] = period.split('-')
  const ayAd = new Date(Number(y), Number(m) - 1).toLocaleString('tr-TR', { month: 'long', year: 'numeric' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Dönem seçici */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => shiftMonth(-1)} style={{ ...s.btnPrimary, padding: '8px 14px', background: '#1E293B' }}>‹</button>
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '700', color: '#F1F5F9', minWidth: '180px', textAlign: 'center', textTransform: 'capitalize' }}>{ayAd}</span>
        <button onClick={() => shiftMonth(1)} style={{ ...s.btnPrimary, padding: '8px 14px', background: '#1E293B' }}>›</button>
      </div>

      {/* Özet kartlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {[
          { label: 'Tahsil Edilen', value: `₺${toplam.toLocaleString('tr-TR')}`, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
          { label: 'Ödendi', value: odendi.length, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
          { label: 'Bekliyor', value: bekliyor.length, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
          { label: 'Gecikmiş', value: gecikm.length, color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
        ].map(c => (
          <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.color}33`, borderRadius: '10px', padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.label}</p>
            <p style={{ fontSize: '22px', fontWeight: '700', color: c.color, fontFamily: 'Syne, sans-serif' }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Tablo */}
      <div style={s.card}>
        {loading ? <Spinner /> : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={s.cardTitle}>Aidat Listesi</h3>
              <span style={{ fontSize: '13px', color: '#64748B' }}>{rows.length} daire</span>
            </div>
            <table style={s.table}>
              <thead><tr>{['Daire', 'Daire Sahibi', 'Tutar', 'Son Ödeme', 'Durum'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} style={s.tr}>
                    <td style={s.td}><span style={s.daireBadge}>{row.block ? `${row.block}-${row.unit_number}` : row.unit_number}</span></td>
                    <td style={s.td}>{row.owner_name || '-'}</td>
                    <td style={s.td}>₺{Number(row.amount).toLocaleString('tr-TR')}</td>
                    <td style={s.td}>{row.due_date ? new Date(row.due_date).toLocaleDateString('tr-TR') : '-'}</td>
                    <td style={s.td}><StatusBadge durum={row.status} /></td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#475569', padding: '32px' }}>Bu dönem için kayıt yok</td></tr>}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}

const emptyDaire = { unit_number: '', block: '', floor: '', type: '', owner_name: '', owner_phone: '', monthly_fee: '', status: 'boş' }

function DairelerContent({ buildingId }) {
  const { data, loading } = useApi(() => client.get(`/api/apartments?building_id=${buildingId}`), [buildingId])
  const [list, setList] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyDaire)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (data) setList(data) }, [data])

  const openEdit = (d) => {
    setEditId(d.id)
    setForm({ unit_number: d.unit_number || '', block: d.block || '', floor: d.floor || '', type: d.type || '', owner_name: d.owner_name || '', owner_phone: d.owner_phone || '', monthly_fee: d.monthly_fee || '', status: d.status || 'boş' })
    setShowForm(false)
    setError('')
  }

  const iptal = () => { setEditId(null); setShowForm(false); setForm(emptyDaire); setError('') }

  const kaydet = async () => {
    if (!form.unit_number) { setError('Daire no zorunlu'); return }
    setSaving(true); setError('')
    try {
      const payload = { ...form, building_id: buildingId, floor: form.floor || null, monthly_fee: form.monthly_fee || 0 }
      if (editId) {
        const { data: updated } = await client.put(`/api/apartments/${editId}`, payload)
        setList(prev => prev.map(d => d.id === editId ? updated : d))
      } else {
        const { data: created } = await client.post('/api/apartments', payload)
        setList(prev => [...(prev || []), created])
      }
      iptal()
    } catch (err) {
      setError(err.response?.data?.error || 'Hata oluştu')
    } finally { setSaving(false) }
  }

  const sil = async (id) => {
    if (!confirm('Bu daireyi silmek istiyor musunuz?')) return
    await client.delete(`/api/apartments/${id}`)
    setList(prev => prev.filter(d => d.id !== id))
  }

  const formAcik = showForm || !!editId

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {formAcik && (
        <div style={s.card}>
          <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>{editId ? 'Daireyi Düzenle' : 'Yeni Daire Ekle'}</h3>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px', color: '#FCA5A5', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <input style={s.input} placeholder="Daire No * (örn: 101)" value={form.unit_number} onChange={e => setForm({ ...form, unit_number: e.target.value })} />
            <input style={s.input} placeholder="Blok (örn: A)" value={form.block} onChange={e => setForm({ ...form, block: e.target.value })} />
            <input style={s.input} placeholder="Kat (örn: 3)" type="number" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} />
            <input style={s.input} placeholder="Tip (örn: 3+1)" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} />
            <input style={s.input} placeholder="Daire Sahibi" value={form.owner_name} onChange={e => setForm({ ...form, owner_name: e.target.value })} />
            <input style={s.input} placeholder="Telefon" value={form.owner_phone} onChange={e => setForm({ ...form, owner_phone: e.target.value })} />
            <input style={s.input} placeholder="Aylık Aidat (₺)" type="number" value={form.monthly_fee} onChange={e => setForm({ ...form, monthly_fee: e.target.value })} />
            <select style={s.input} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="boş">Boş</option>
              <option value="dolu">Dolu</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button style={s.btnPrimary} onClick={kaydet} disabled={saving}>{saving ? 'Kaydediliyor...' : '✓ Kaydet'}</button>
            <button style={{ ...s.btnPrimary, background: 'rgba(255,255,255,0.06)' }} onClick={iptal}>İptal</button>
          </div>
        </div>
      )}

      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={s.cardTitle}>Daire Listesi</h3>
          <button style={s.btnPrimary} onClick={() => { setShowForm(true); setEditId(null); setForm(emptyDaire) }}>+ Yeni Daire</button>
        </div>
        {loading ? <Spinner /> : (
          <table style={s.table}>
            <thead><tr>{['Daire No', 'Kat', 'Tip', 'Daire Sahibi', 'Telefon', 'Aylık Aidat', 'Durum', 'İşlem'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {(list || []).map(d => (
                <tr key={d.id} style={{ ...s.tr, ...(editId === d.id ? { background: 'rgba(59,130,246,0.06)' } : {}) }}>
                  <td style={s.td}><span style={s.daireBadge}>{d.block ? `${d.block}-${d.unit_number}` : d.unit_number}</span></td>
                  <td style={s.td}>{d.floor ? `${d.floor}. Kat` : '-'}</td>
                  <td style={s.td}>{d.type || '-'}</td>
                  <td style={s.td}>{d.owner_name || '-'}</td>
                  <td style={s.td}>{d.owner_phone || '-'}</td>
                  <td style={s.td}>₺{Number(d.monthly_fee || 0).toLocaleString('tr-TR')}</td>
                  <td style={s.td}><span style={{ ...s.badge, background: d.status === 'dolu' ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)', color: d.status === 'dolu' ? '#10B981' : '#64748B' }}>{d.status}</span></td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEdit(d)} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Düzenle</button>
                      <button onClick={() => sil(d.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '13px' }}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!list?.length && <tr><td colSpan={8} style={{ ...s.td, textAlign: 'center', color: '#475569', padding: '30px' }}>Henüz daire eklenmedi</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function DuyurularContent({ buildingId }) {
  const { data: apartmentData } = useApi(() => client.get(`/api/apartments?building_id=${buildingId}`), [buildingId])
  const [form, setForm] = useState({ title: '', content: '', priority: 'normal', apartment_id: '' })
  const [saving, setSaving] = useState(false)
  const [list, setList] = useState(null)
  const [listLoading, setListLoading] = useState(true)

  useEffect(() => {
    client.get(`/api/announcements?building_id=${buildingId}`)
      .then(r => setList(r.data))
      .finally(() => setListLoading(false))
  }, [buildingId])

  const ekle = async () => {
    if (!form.title || !form.content) return
    setSaving(true)
    try {
      const payload = {
        building_id: buildingId,
        title: form.title,
        content: form.content,
        priority: form.priority,
        apartment_id: form.apartment_id || null,
      }
      const { data: created } = await client.post('/api/announcements', payload)
      setList(prev => [created, ...(prev || [])])
      setForm({ title: '', content: '', priority: 'normal', apartment_id: '' })
    } catch { } finally { setSaving(false) }
  }

  const sil = async (id) => {
    try {
      await client.delete(`/api/announcements/${id}`)
      setList(prev => prev.filter(d => d.id !== id))
    } catch { }
  }

  const apartments = apartmentData || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={s.card}>
        <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Yeni Duyuru Ekle</h3>
        <input style={{ ...s.input, marginBottom: '12px' }} placeholder="Duyuru başlığı" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <select style={s.input} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option value="normal">Normal</option>
            <option value="önemli">Önemli</option>
            <option value="acil">Acil</option>
          </select>
          <select style={s.input} value={form.apartment_id} onChange={e => setForm({ ...form, apartment_id: e.target.value })}>
            <option value="">📢 Tüm Binaya</option>
            {apartments.map(a => (
              <option key={a.id} value={a.id}>
                🏠 {a.block ? `${a.block}-${a.unit_number}` : a.unit_number}{a.owner_name ? ` (${a.owner_name})` : ''}
              </option>
            ))}
          </select>
        </div>
        <textarea style={{ ...s.input, height: '90px', resize: 'vertical' }} placeholder="Duyuru içeriği..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
        <button style={{ ...s.btnPrimary, marginTop: '12px' }} onClick={ekle} disabled={saving}>
          {saving ? 'Yayınlanıyor...' : '📣 Duyuru Yayınla'}
        </button>
      </div>
      {listLoading ? <Spinner /> : ['genel', 'daire'].map(tip => {
        const baslik = tip === 'genel' ? '📢 Genel Duyurular' : '🏠 Daire Bazlı Duyurular'
        const renk = tip === 'genel' ? '#60A5FA' : '#A78BFA'
        const liste = (list || []).filter(d => tip === 'genel' ? !d.apartment_id : !!d.apartment_id)
        return (
          <div key={tip} style={s.card}>
            <h3 style={{ ...s.cardTitle, marginBottom: '16px', color: renk }}>{baslik}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {liste.map(d => (
                <div key={d.id} style={s.duyuruItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={s.duyuruBaslik}>{d.title}</span>
                      {d.apartment_id && (
                        <span style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', background: 'rgba(139,92,246,0.15)', color: '#A78BFA', fontWeight: '500' }}>
                          {d.target_block ? `${d.target_block}-${d.target_unit}` : d.target_unit}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={s.duyuruTarih}>{new Date(d.created_at).toLocaleDateString('tr-TR')}</span>
                      <button onClick={() => sil(d.id)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '14px', padding: '2px' }} title="Sil">🗑</button>
                    </div>
                  </div>
                  <p style={s.duyuruIcerik}>{d.content}</p>
                </div>
              ))}
              {!liste.length && <p style={{ color: '#475569', fontSize: '14px' }}>Henüz duyuru yok</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ArizalarContent({ buildingId }) {
  const [repairs, setRepairs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    client.get(`/api/repairs?building_id=${buildingId}`)
      .then(r => setRepairs(r.data))
      .finally(() => setLoading(false))
  }, [buildingId])

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      await client.put(`/api/repairs/${id}`, { status })
      setRepairs(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    } catch {
      alert('Durum güncellenemedi.')
    } finally {
      setUpdating(null)
    }
  }

  const statusOptions = ['bekliyor', 'inceleniyor', 'tamamlandı']

  if (loading) return <Spinner />
  return (
    <div style={s.card}>
      <h3 style={{ ...s.cardTitle, marginBottom: '20px' }}>Arıza Bildirimleri</h3>
      <table style={s.table}>
        <thead><tr>{['No', 'Konu', 'Fotoğraf', 'Daire', 'Daire Sahibi', 'Tarih', 'Durum'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
        <tbody>
          {(repairs || []).map(a => (
            <tr key={a.id} style={s.tr}>
              <td style={s.td}><span style={{ color: '#64748B', fontSize: '13px' }}>#{a.id}</span></td>
              <td style={s.td}>
                <p style={{ color: '#E2E8F0', fontWeight: '500' }}>{a.title}</p>
                {a.description && <p style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>{a.description}</p>}
              </td>
              <td style={s.td}>
                {a.photo_data
                  ? <img
                      src={`data:${a.photo_type};base64,${a.photo_data}`}
                      alt="fotoğraf"
                      style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => {
                        const blob = new Blob([Uint8Array.from(atob(a.photo_data), c => c.charCodeAt(0))], { type: a.photo_type })
                        window.open(URL.createObjectURL(blob), '_blank')
                      }}
                    />
                  : <span style={{ color: '#475569', fontSize: '12px' }}>—</span>
                }
              </td>
              <td style={s.td}><span style={s.daireBadge}>{a.block ? `${a.block}-${a.unit_number}` : (a.unit_number || 'Genel')}</span></td>
              <td style={s.td}>{a.reported_by_name || '-'}</td>
              <td style={s.td}>{new Date(a.created_at).toLocaleDateString('tr-TR')}</td>
              <td style={s.td}>
                <select
                  value={a.status}
                  disabled={updating === a.id}
                  onChange={e => updateStatus(a.id, e.target.value)}
                  style={{
                    background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px', padding: '5px 10px', color: '#F1F5F9',
                    fontSize: '13px', cursor: 'pointer', outline: 'none',
                    opacity: updating === a.id ? 0.5 : 1,
                  }}
                >
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function GiderlerContent({ buildingId }) {
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [list, setList] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ category: 'Temizlik', description: '', amount: '', period: new Date().toISOString().slice(0, 7) })
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setLoading(true)
    client.get(`/api/expenses?building_id=${buildingId}&period=${selectedPeriod}`)
      .then(r => setList(r.data))
      .finally(() => setLoading(false))
  }, [buildingId, selectedPeriod])

  const shiftMonth = (dir) => {
    const d = new Date(selectedPeriod + '-01')
    d.setMonth(d.getMonth() + dir)
    setSelectedPeriod(d.toISOString().slice(0, 7))
  }

  const kaydet = async () => {
    if (!form.amount || !form.category) return
    setSaving(true)
    try {
      const { data: created } = await client.post('/api/expenses', { building_id: buildingId, ...form, amount: Number(form.amount) })
      if (created.period === selectedPeriod) setList(prev => [created, ...(prev || [])])
      setForm({ category: 'Temizlik', description: '', amount: '', period: new Date().toISOString().slice(0, 7) })
      setShowForm(false)
    } catch { } finally { setSaving(false) }
  }

  const sil = async (id) => {
    if (!confirm('Bu gideri silmek istiyor musunuz?')) return
    await client.delete(`/api/expenses/${id}`)
    setList(prev => prev.filter(g => g.id !== id))
  }

  const toplam = (list || []).reduce((acc, g) => acc + Number(g.amount), 0)
  const kategoriler = ['Temizlik', 'Bakım', 'Tadilat', 'Elektrik', 'Su', 'Asansör', 'Güvenlik', 'Diğer']

  const [y, m] = selectedPeriod.split('-')
  const ayAd = new Date(Number(y), Number(m) - 1).toLocaleString('tr-TR', { month: 'long', year: 'numeric' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Dönem seçici + Ekle butonu */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => shiftMonth(-1)} style={{ ...s.btnPrimary, padding: '8px 14px', background: '#1E293B' }}>‹</button>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '700', color: '#F1F5F9', minWidth: '180px', textAlign: 'center', textTransform: 'capitalize' }}>{ayAd}</span>
          <button onClick={() => shiftMonth(1)} style={{ ...s.btnPrimary, padding: '8px 14px', background: '#1E293B' }}>›</button>
        </div>
        <button onClick={() => setShowForm(f => !f)} style={s.btnPrimary}>
          {showForm ? '✕ İptal' : '+ Gider Ekle'}
        </button>
      </div>

      {/* Gider Ekleme Formu */}
      {showForm && (
        <div style={s.card}>
          <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Yeni Gider Ekle</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <select style={s.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {kategoriler.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <input style={s.input} type="number" placeholder="Tutar (₺)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            <input style={s.input} type="month" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} />
          </div>
          <input style={{ ...s.input, marginBottom: '12px' }} placeholder="Açıklama (isteğe bağlı)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <button style={s.btnPrimary} onClick={kaydet} disabled={saving}>
            {saving ? 'Kaydediliyor...' : '💾 Kaydet'}
          </button>
        </div>
      )}

      {/* Özet */}
      <div style={{ ...s.statCard, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <p style={s.statLabel}>{ayAd} Toplam Gider</p>
        <p style={{ ...s.statValue, color: '#EF4444', fontSize: '32px' }}>₺{toplam.toLocaleString('tr-TR')}</p>
      </div>

      {/* Tablo */}
      <div style={s.card}>
        <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Gider Detayları</h3>
        {loading ? <Spinner /> : (
          <table style={s.table}>
            <thead><tr>{['Kategori', 'Açıklama', 'Dönem', 'Tutar', ''].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {(list || []).map(g => (
                <tr key={g.id} style={s.tr}>
                  <td style={s.td}><span style={{ ...s.badge, background: 'rgba(59,130,246,0.12)', color: '#60A5FA' }}>{g.category}</span></td>
                  <td style={s.td}>{g.description || '-'}</td>
                  <td style={s.td}>{g.period}</td>
                  <td style={{ ...s.td, color: '#EF4444', fontWeight: '600' }}>₺{Number(g.amount).toLocaleString('tr-TR')}</td>
                  <td style={s.td}>
                    <button onClick={() => sil(g.id)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '14px' }}>🗑</button>
                  </td>
                </tr>
              ))}
              {!list?.length && <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#475569', padding: '32px' }}>Bu dönem için gider yok</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function KullanicilarContent({ buildingId }) {
  const { data: apartments } = useApi(() => client.get(`/api/apartments?building_id=${buildingId}`), [buildingId])
  const { data, loading } = useApi(() => client.get(`/api/users?building_id=${buildingId}`), [buildingId])
  const [list, setList] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', apartment_id: '', role: 'resident' })
  const [editUser, setEditUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { if (data) setList(data) }, [data])

  const kaydet = async () => {
    if (!form.name || !form.email || !form.password) { setError('İsim, e-posta ve şifre zorunlu'); return }
    setSaving(true); setError('')
    try {
      const { data: created } = await client.post('/api/users', { ...form, building_id: buildingId, apartment_id: form.apartment_id || null })
      setList(prev => [...(prev || []), created])
      setForm({ name: '', email: '', password: '', apartment_id: '', role: 'resident' })
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Hata oluştu')
    } finally { setSaving(false) }
  }

  const guncelle = async () => {
    if (!editUser.name) { setError('İsim zorunlu'); return }
    setSaving(true); setError('')
    try {
      const payload = { name: editUser.name, role: editUser.role, apartment_id: editUser.apartment_id || null, building_id: buildingId }
      if (editUser.password) payload.password = editUser.password
      const { data: updated } = await client.put(`/api/users/${editUser.id}`, payload)
      setList(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u))
      setEditUser(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Hata oluştu')
    } finally { setSaving(false) }
  }

  const sil = async (id) => {
    if (!confirm('Bu kullanıcıyı devre dışı bırakmak istiyor musunuz?')) return
    await client.delete(`/api/users/${id}`)
    setList(prev => prev.filter(u => u.id !== id))
  }

  const aptLabel = (id) => {
    const a = (apartments || []).find(a => a.id === parseInt(id))
    return a ? (a.block ? `${a.block}-${a.unit_number}` : a.unit_number) : '-'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Yeni kullanıcı formu */}
      {showForm && (
        <div style={s.card}>
          <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Yeni Kullanıcı Ekle</h3>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px', color: '#FCA5A5', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input style={s.input} placeholder="Ad Soyad" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input style={s.input} placeholder="E-posta" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input style={s.input} placeholder="Şifre (min. 6 karakter)" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <select style={s.input} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="resident">Sakin</option>
              <option value="admin">Yönetici</option>
            </select>
            <select style={s.input} value={form.apartment_id} onChange={e => setForm({ ...form, apartment_id: e.target.value })}>
              <option value="">Daire Seç (opsiyonel)</option>
              {(apartments || []).map(a => <option key={a.id} value={a.id}>{a.block ? `${a.block}-${a.unit_number}` : a.unit_number}{a.owner_name ? ` (${a.owner_name})` : ''}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button style={s.btnPrimary} onClick={kaydet} disabled={saving}>{saving ? 'Kaydediliyor...' : '✓ Kaydet'}</button>
            <button style={{ ...s.btnPrimary, background: 'rgba(255,255,255,0.06)' }} onClick={() => { setShowForm(false); setError('') }}>İptal</button>
          </div>
        </div>
      )}

      {/* Düzenleme formu */}
      {editUser && (
        <div style={{ ...s.card, border: '1px solid rgba(59,130,246,0.3)' }}>
          <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>Kullanıcı Düzenle — {editUser.email}</h3>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px', color: '#FCA5A5', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input style={s.input} placeholder="Ad Soyad" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })} />
            <select style={s.input} value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
              <option value="resident">Sakin</option>
              <option value="admin">Yönetici</option>
            </select>
            <select style={s.input} value={editUser.apartment_id || ''} onChange={e => setEditUser({ ...editUser, apartment_id: e.target.value })}>
              <option value="">Daire Seç</option>
              {(apartments || []).map(a => <option key={a.id} value={a.id}>{a.block ? `${a.block}-${a.unit_number}` : a.unit_number}{a.owner_name ? ` (${a.owner_name})` : ''}</option>)}
            </select>
            <input style={s.input} placeholder="Yeni şifre (değiştirmek için doldur)" type="password" value={editUser.password || ''} onChange={e => setEditUser({ ...editUser, password: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button style={s.btnPrimary} onClick={guncelle} disabled={saving}>{saving ? 'Kaydediliyor...' : '✓ Güncelle'}</button>
            <button style={{ ...s.btnPrimary, background: 'rgba(255,255,255,0.06)' }} onClick={() => { setEditUser(null); setError('') }}>İptal</button>
          </div>
        </div>
      )}

      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={s.cardTitle}>Kullanıcılar</h3>
          <button style={s.btnPrimary} onClick={() => setShowForm(true)}>+ Yeni Kullanıcı</button>
        </div>
        {loading ? <div style={{ color: '#475569' }}>Yükleniyor...</div> : (
          <table style={s.table}>
            <thead><tr>{['İsim', 'E-posta', 'Rol', 'Daire', 'Durum', 'İşlem'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {(list || []).map(u => (
                <tr key={u.id} style={s.tr}>
                  <td style={s.td}>{u.name}</td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}>
                    <span style={{ ...s.badge, background: u.role === 'admin' ? 'rgba(59,130,246,0.12)' : 'rgba(16,185,129,0.08)', color: u.role === 'admin' ? '#60A5FA' : '#34D399' }}>
                      {u.role === 'admin' ? 'Yönetici' : 'Sakin'}
                    </span>
                  </td>
                  <td style={s.td}>{u.apartment_id ? <span style={s.daireBadge}>{aptLabel(u.apartment_id)}</span> : '-'}</td>
                  <td style={s.td}><span style={{ ...s.badge, background: u.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)', color: u.is_active ? '#10B981' : '#64748B' }}>{u.is_active ? 'Aktif' : 'Pasif'}</span></td>
                  <td style={s.td}>
                    <button onClick={() => { setEditUser({ ...u, password: '' }); setError(''); setShowForm(false) }} style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontSize: '13px', marginRight: '10px' }}>Düzenle</button>
                    <button onClick={() => sil(u.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '13px' }}>Devre Dışı</button>
                  </td>
                </tr>
              ))}
              {!list?.length && <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#475569', padding: '30px' }}>Henüz kayıtlı kullanıcı yok</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ durum }) {
  const map = {
    'ödendi':     { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
    'bekliyor':   { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
    'gecikmiş':   { bg: 'rgba(239,68,68,0.12)',  color: '#EF4444' },
    'tamamlandı': { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
    'inceleniyor':{ bg: 'rgba(59,130,246,0.12)', color: '#60A5FA' },
  }
  const c = map[durum] || { bg: 'rgba(100,116,139,0.12)', color: '#94A3B8' }
  return <span style={{ ...s.badge, background: c.bg, color: c.color }}>{durum}</span>
}

const s = {
  main:       { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-page)' },
  topbar:     { padding: '24px 32px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-page)' },
  pageTitle:  { fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: '700', color: 'var(--t1)' },
  pageDate:   { fontSize: '13px', color: 'var(--t5)', marginTop: '2px' },
  content:    { flex: 1, overflow: 'auto', padding: '28px 32px' },
  statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' },
  statCard:   { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' },
  statLabel:  { fontSize: '12px', color: 'var(--t4)', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statValue:  { fontSize: '28px', fontFamily: 'Syne, sans-serif', fontWeight: '700', marginBottom: '4px' },
  statSub:    { fontSize: '12px', color: 'var(--t5)' },
  statIcon:   { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
  twoCol:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  card:       { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' },
  cardTitle:  { fontSize: '15px', fontWeight: '600', color: 'var(--t1)', marginBottom: '16px', fontFamily: 'Syne, sans-serif' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  th:         { textAlign: 'left', padding: '10px 12px', fontSize: '11px', color: 'var(--t5)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)' },
  tr:         { borderBottom: '1px solid var(--border-soft)' },
  td:         { padding: '12px', fontSize: '14px', color: 'var(--t3)' },
  badge:      { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  daireBadge: { padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', background: 'rgba(59,130,246,0.1)', color: '#60A5FA', fontFamily: 'monospace' },
  duyuruItem: { padding: '14px', background: 'var(--bg-hover)', borderRadius: '8px', border: '1px solid var(--border)' },
  duyuruBaslik:{ fontSize: '14px', fontWeight: '600', color: 'var(--t1)' },
  duyuruTarih: { fontSize: '12px', color: 'var(--t5)' },
  duyuruIcerik:{ fontSize: '13px', color: 'var(--t4)', marginTop: '6px', lineHeight: 1.5 },
  btnPrimary:  { background: 'linear-gradient(135deg, #3B82F6, #2563EB)', border: 'none', borderRadius: '8px', padding: '10px 18px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  btnDanger:   { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '8px 14px', color: '#EF4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  btnSecondary:{ background: 'var(--bg-input)', border: '1px solid var(--border-strong)', borderRadius: '8px', padding: '8px 14px', color: 'var(--t3)', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' },
  input:       { width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-strong)', borderRadius: '8px', padding: '12px 14px', color: 'var(--t1)', fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif', display: 'block', boxSizing: 'border-box' },
  formRow:     { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  label:       { fontSize: '12px', color: 'var(--t4)', fontWeight: '600', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.4px' },
  modalOverlay:{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 },
  modal:       { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', width: '480px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle:  { fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: '700', color: 'var(--t1)', marginBottom: '20px' },
  statusBadge: { padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
}

// ─── YARDIMCI ────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={s.modalOverlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ ...s.modalTitle, marginBottom: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--t4)', cursor: 'pointer', fontSize: '20px' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  )
}

function StatusPill({ status, map }) {
  const def = map[status] || { bg: 'rgba(100,116,139,0.12)', color: '#94A3B8' }
  return <span style={{ ...s.statusBadge, background: def.bg, color: def.color }}>{def.label || status}</span>
}

// ─── BAKIM TAKVİMİ ───────────────────────────────────────────────────────────
function BakimContent({ buildingId }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', category: 'genel', scheduled_date: '', notes: '' })

  const load = () => {
    setLoading(true)
    client.get(`/api/maintenance?building_id=${buildingId}`)
      .then(r => setList(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openAdd = () => { setForm({ title: '', description: '', category: 'genel', scheduled_date: '', notes: '' }); setEditItem(null); setShowModal(true) }
  const openEdit = item => { setForm({ title: item.title, description: item.description || '', category: item.category, scheduled_date: item.scheduled_date?.split('T')[0] || '', notes: item.notes || '' }); setEditItem(item); setShowModal(true) }

  const save = async () => {
    if (!form.title || !form.scheduled_date) return
    try {
      if (editItem) await client.put(`/api/maintenance/${editItem.id}`, { ...form, building_id: buildingId })
      else await client.post('/api/maintenance', { ...form, building_id: buildingId })
      setShowModal(false); load()
    } catch {}
  }

  const updateStatus = async (id, status) => {
    await client.put(`/api/maintenance/${id}`, { status, completed_date: status === 'tamamlandi' ? new Date().toISOString().split('T')[0] : null })
    load()
  }

  const del = async id => { if (confirm('Silinsin mi?')) { await client.delete(`/api/maintenance/${id}`); load() } }

  const statusMap = {
    bekliyor:    { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: 'Bekliyor' },
    tamamlandi:  { bg: 'rgba(16,185,129,0.12)', color: '#10B981', label: 'Tamamlandı' },
    ertelendi:   { bg: 'rgba(239,68,68,0.12)',  color: '#EF4444', label: 'Ertelendi' },
  }

  const categories = ['genel', 'asansör', 'yangın tüpü', 'elektrik', 'su', 'ısıtma', 'bahçe', 'güvenlik']

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div />
        <button style={s.btnPrimary} onClick={openAdd}>+ Yeni Bakım Planı</button>
      </div>

      {loading ? <Spinner /> : (
        <div style={s.card}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Başlık', 'Kategori', 'Planlanan Tarih', 'Durum', 'İşlemler'].map(h => <th key={h} style={s.th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {list.map(item => (
                <tr key={item.id} style={s.tr}>
                  <td style={s.td}><div style={{ fontWeight: 600, color: 'var(--t1)' }}>{item.title}</div><div style={{ fontSize: 12, color: 'var(--t5)' }}>{item.description}</div></td>
                  <td style={s.td}><span style={s.badge}>{item.category}</span></td>
                  <td style={s.td}>{new Date(item.scheduled_date).toLocaleDateString('tr-TR')}</td>
                  <td style={s.td}><StatusPill status={item.status} map={statusMap} /></td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {item.status === 'bekliyor' && <button style={s.btnPrimary} onClick={() => updateStatus(item.id, 'tamamlandi')}>✓ Tamamla</button>}
                      <button style={s.btnSecondary} onClick={() => openEdit(item)}>Düzenle</button>
                      <button style={s.btnDanger} onClick={() => del(item.id)}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: 'var(--t5)' }}>Kayıt yok</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editItem ? 'Bakım Planını Düzenle' : 'Yeni Bakım Planı'} onClose={() => setShowModal(false)}>
          <FormField label="Başlık"><input style={s.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Kategori">
            <select style={s.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Planlanan Tarih"><input style={s.input} type="date" value={form.scheduled_date} onChange={e => setForm({ ...form, scheduled_date: e.target.value })} /></FormField>
          <FormField label="Açıklama"><textarea style={{ ...s.input, height: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></FormField>
          <FormField label="Notlar"><input style={s.input} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button style={s.btnPrimary} onClick={save}>Kaydet</button>
            <button style={s.btnSecondary} onClick={() => setShowModal(false)}>İptal</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── BELGELER ────────────────────────────────────────────────────────────────
function BelgelerContent({ buildingId, isAdmin }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'diger', is_public: true })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const load = () => {
    setLoading(true)
    client.get(`/api/documents?building_id=${buildingId}`)
      .then(r => setList(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleFile = e => {
    const f = e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = ev => setFile({ name: f.name, type: f.type, size: f.size, data: ev.target.result.split(',')[1] })
    reader.readAsDataURL(f)
  }

  const upload = async () => {
    if (!form.title || !file) return
    setUploading(true)
    try {
      await client.post('/api/documents', { building_id: buildingId, ...form, file_name: file.name, file_data: file.data, file_type: file.type, file_size: file.size })
      setShowModal(false); setFile(null); setForm({ title: '', description: '', category: 'diger', is_public: true }); load()
    } catch {} finally { setUploading(false) }
  }

  const download = async doc => {
    try {
      const { data } = await client.get(`/api/documents/${doc.id}/download`)
      const link = document.createElement('a')
      link.href = `data:${data.file_type};base64,${data.file_data}`
      link.download = data.file_name
      link.click()
    } catch {}
  }

  const del = async id => { if (confirm('Silinsin mi?')) { await client.delete(`/api/documents/${id}`); load() } }

  const cats = ['yonetim-plani', 'karar', 'tutanak', 'sigorta', 'diger']
  const catLabel = { 'yonetim-plani': 'Yönetim Planı', karar: 'Karar', tutanak: 'Tutanak', sigorta: 'Sigorta', diger: 'Diğer' }

  return (
    <div>
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <button style={s.btnPrimary} onClick={() => setShowModal(true)}>+ Belge Yükle</button>
        </div>
      )}
      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {list.map(doc => (
            <div key={doc.id} style={{ ...s.card, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 32, textAlign: 'center' }}>📄</div>
              <div style={{ fontWeight: 600, color: 'var(--t1)', textAlign: 'center' }}>{doc.title}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ ...s.badge, background: 'rgba(59,130,246,0.1)', color: '#60A5FA' }}>{catLabel[doc.category] || doc.category}</span>
                {!doc.is_public && <span style={{ ...s.badge, background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>Gizli</span>}
              </div>
              {doc.description && <div style={{ fontSize: 13, color: 'var(--t4)', textAlign: 'center' }}>{doc.description}</div>}
              <div style={{ fontSize: 12, color: 'var(--t5)', textAlign: 'center' }}>{new Date(doc.created_at).toLocaleDateString('tr-TR')}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ ...s.btnPrimary, flex: 1 }} onClick={() => download(doc)}>⬇ İndir</button>
                {isAdmin && <button style={s.btnDanger} onClick={() => del(doc.id)}>Sil</button>}
              </div>
            </div>
          ))}
          {!list.length && <div style={{ color: 'var(--t5)', padding: 40 }}>Henüz belge yüklenmedi</div>}
        </div>
      )}

      {showModal && (
        <Modal title="Belge Yükle" onClose={() => setShowModal(false)}>
          <FormField label="Başlık"><input style={s.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Kategori">
            <select style={s.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {cats.map(c => <option key={c} value={c}>{catLabel[c]}</option>)}
            </select>
          </FormField>
          <FormField label="Açıklama"><input style={s.input} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></FormField>
          <FormField label="Dosya"><input type="file" style={s.input} onChange={handleFile} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png" /></FormField>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_public} onChange={e => setForm({ ...form, is_public: e.target.checked })} />
            <span style={{ color: 'var(--t3)', fontSize: 14 }}>Sakinlere görünür</span>
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={s.btnPrimary} onClick={upload} disabled={uploading}>{uploading ? 'Yükleniyor...' : 'Yükle'}</button>
            <button style={s.btnSecondary} onClick={() => setShowModal(false)}>İptal</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── ANKET ───────────────────────────────────────────────────────────────────
function AnketContent({ buildingId, user, isAdmin }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', options: ['', ''], ends_at: '' })

  const load = () => {
    setLoading(true)
    client.get(`/api/surveys?building_id=${buildingId}`)
      .then(r => setList(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openDetail = async survey => {
    const { data } = await client.get(`/api/surveys/${survey.id}`)
    setDetail(data)
  }

  const vote = async optionId => {
    await client.post(`/api/surveys/${detail.id}/vote`, { option_id: optionId })
    openDetail(detail)
  }

  const create = async () => {
    const opts = form.options.filter(o => o.trim())
    if (!form.title || opts.length < 2) return
    await client.post('/api/surveys', { building_id: buildingId, ...form, options: opts })
    setShowCreate(false); setForm({ title: '', description: '', options: ['', ''], ends_at: '' }); load()
  }

  const toggleStatus = async survey => {
    await client.put(`/api/surveys/${survey.id}`, { status: survey.status === 'aktif' ? 'kapali' : 'aktif' })
    load()
  }

  const del = async id => { if (confirm('Silinsin mi?')) { await client.delete(`/api/surveys/${id}`); load() } }

  return (
    <div>
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <button style={s.btnPrimary} onClick={() => setShowCreate(true)}>+ Yeni Anket</button>
        </div>
      )}
      {loading ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {list.map(survey => (
            <div key={survey.id} style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--t1)', fontSize: 15 }}>{survey.title}</div>
                  {survey.description && <div style={{ color: 'var(--t4)', fontSize: 13, marginTop: 4 }}>{survey.description}</div>}
                  <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ ...s.badge, background: survey.status === 'aktif' ? 'rgba(16,185,129,0.12)' : 'rgba(100,116,139,0.12)', color: survey.status === 'aktif' ? '#10B981' : '#64748B' }}>{survey.status === 'aktif' ? 'Aktif' : 'Kapalı'}</span>
                    <span style={{ fontSize: 12, color: 'var(--t5)' }}>{survey.total_votes} oy · {survey.options_count} seçenek</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={s.btnSecondary} onClick={() => openDetail(survey)}>Sonuçlar</button>
                  {isAdmin && <>
                    <button style={s.btnSecondary} onClick={() => toggleStatus(survey)}>{survey.status === 'aktif' ? 'Kapat' : 'Aç'}</button>
                    <button style={s.btnDanger} onClick={() => del(survey.id)}>Sil</button>
                  </>}
                </div>
              </div>
            </div>
          ))}
          {!list.length && <div style={{ color: 'var(--t5)', padding: 40, textAlign: 'center' }}>Henüz anket oluşturulmadı</div>}
        </div>
      )}

      {detail && (
        <Modal title={detail.title} onClose={() => setDetail(null)}>
          {detail.description && <p style={{ color: 'var(--t4)', marginBottom: 16 }}>{detail.description}</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {detail.options?.map(opt => {
              const total = detail.options.reduce((s, o) => s + parseInt(o.vote_count), 0)
              const pct = total ? Math.round(parseInt(opt.vote_count) / total * 100) : 0
              const isMyVote = detail.my_vote === opt.id
              return (
                <div key={opt.id} style={{ border: `1px solid ${isMyVote ? '#3B82F6' : 'var(--border)'}`, borderRadius: 10, padding: '12px 16px', background: isMyVote ? 'rgba(59,130,246,0.08)' : 'var(--bg-hover)', cursor: detail.my_vote || detail.status !== 'aktif' ? 'default' : 'pointer' }}
                  onClick={() => !detail.my_vote && detail.status === 'aktif' && vote(opt.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--t1)', fontWeight: isMyVote ? 600 : 400 }}>{opt.option_text} {isMyVote && '✓'}</span>
                    <span style={{ color: 'var(--t4)', fontSize: 13 }}>{opt.vote_count} oy ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: isMyVote ? '#3B82F6' : '#64748B', borderRadius: 3 }} />
                  </div>
                </div>
              )
            })}
          </div>
          {!detail.my_vote && detail.status === 'aktif' && <p style={{ color: 'var(--t5)', fontSize: 13, textAlign: 'center' }}>Bir seçeneğe tıklayarak oy kullanın</p>}
        </Modal>
      )}

      {showCreate && (
        <Modal title="Yeni Anket Oluştur" onClose={() => setShowCreate(false)}>
          <FormField label="Başlık"><input style={s.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Açıklama"><input style={s.input} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></FormField>
          <FormField label="Bitiş Tarihi (isteğe bağlı)"><input style={s.input} type="datetime-local" value={form.ends_at} onChange={e => setForm({ ...form, ends_at: e.target.value })} /></FormField>
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Seçenekler</label>
            {form.options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input style={{ ...s.input, flex: 1 }} placeholder={`Seçenek ${i + 1}`} value={opt} onChange={e => { const o = [...form.options]; o[i] = e.target.value; setForm({ ...form, options: o }) }} />
                {form.options.length > 2 && <button style={s.btnDanger} onClick={() => setForm({ ...form, options: form.options.filter((_, j) => j !== i) })}>✕</button>}
              </div>
            ))}
            <button style={s.btnSecondary} onClick={() => setForm({ ...form, options: [...form.options, ''] })}>+ Seçenek Ekle</button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={s.btnPrimary} onClick={create}>Oluştur</button>
            <button style={s.btnSecondary} onClick={() => setShowCreate(false)}>İptal</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── REZERVASYON ─────────────────────────────────────────────────────────────
function RezervasyonContent({ buildingId, user, isAdmin }) {
  const [areas, setAreas] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showAreaModal, setShowAreaModal] = useState(false)
  const [form, setForm] = useState({ common_area_id: '', date: new Date().toISOString().split('T')[0], start_time: '', end_time: '', purpose: '' })
  const [areaForm, setAreaForm] = useState({ name: '', description: '', capacity: '' })
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const load = () => {
    setLoading(true)
    Promise.all([
      client.get(`/api/reservations/areas?building_id=${buildingId}`),
      client.get(`/api/reservations?building_id=${buildingId}&date=${selectedDate}`)
    ]).then(([a, r]) => { setAreas(a.data); setReservations(r.data) }).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [selectedDate])

  const createReservation = async () => {
    if (!form.common_area_id || !form.date || !form.start_time || !form.end_time) return
    try {
      await client.post('/api/reservations', { ...form, building_id: buildingId })
      setShowModal(false); load()
    } catch (e) { alert(e.response?.data?.error || 'Hata oluştu') }
  }

  const createArea = async () => {
    if (!areaForm.name) return
    await client.post('/api/reservations/areas', { ...areaForm, building_id: buildingId })
    setShowAreaModal(false); setAreaForm({ name: '', description: '', capacity: '' }); load()
  }

  const cancelRes = async id => { await client.delete(`/api/reservations/${id}`); load() }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ color: 'var(--t4)', fontSize: 14 }}>Tarih:</span>
          <input style={{ ...s.input, width: 160 }} type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isAdmin && <button style={s.btnSecondary} onClick={() => setShowAreaModal(true)}>+ Ortak Alan Ekle</button>}
          <button style={s.btnPrimary} onClick={() => setShowModal(true)}>+ Rezervasyon Yap</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        <div style={s.card}>
          <div style={s.cardTitle}>Ortak Alanlar</div>
          {areas.map(a => (
            <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
              <div style={{ fontWeight: 600, color: 'var(--t1)' }}>{a.name}</div>
              {a.capacity && <div style={{ fontSize: 12, color: 'var(--t5)' }}>Kapasite: {a.capacity} kişi</div>}
              {a.description && <div style={{ fontSize: 12, color: 'var(--t4)' }}>{a.description}</div>}
            </div>
          ))}
          {!areas.length && <div style={{ color: 'var(--t5)', fontSize: 13 }}>Alan tanımlı değil</div>}
        </div>
        <div style={s.card}>
          <div style={s.cardTitle}>Rezervasyonlar — {new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</div>
          {loading ? <Spinner /> : reservations.map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--t1)' }}>{r.area_name}</span>
                <span style={{ color: 'var(--t4)', fontSize: 13, marginLeft: 8 }}>{r.start_time?.slice(0,5)}–{r.end_time?.slice(0,5)}</span>
                <div style={{ fontSize: 12, color: 'var(--t5)' }}>{r.user_name} {r.unit_number && `· Daire ${r.unit_number}`} {r.purpose && `· ${r.purpose}`}</div>
              </div>
              {(isAdmin || r.user_id === user?.id) && <button style={s.btnDanger} onClick={() => cancelRes(r.id)}>İptal</button>}
            </div>
          ))}
          {!loading && !reservations.length && <div style={{ color: 'var(--t5)', fontSize: 13, textAlign: 'center', padding: 20 }}>Bu tarihte rezervasyon yok</div>}
        </div>
      </div>

      {showModal && (
        <Modal title="Rezervasyon Yap" onClose={() => setShowModal(false)}>
          <FormField label="Ortak Alan">
            <select style={s.input} value={form.common_area_id} onChange={e => setForm({ ...form, common_area_id: e.target.value })}>
              <option value="">Seçin</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </FormField>
          <FormField label="Tarih"><input style={s.input} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Başlangıç"><input style={s.input} type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} /></FormField>
            <FormField label="Bitiş"><input style={s.input} type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} /></FormField>
          </div>
          <FormField label="Amaç"><input style={s.input} value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} /></FormField>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={s.btnPrimary} onClick={createReservation}>Rezervasyon Yap</button>
            <button style={s.btnSecondary} onClick={() => setShowModal(false)}>İptal</button>
          </div>
        </Modal>
      )}

      {showAreaModal && (
        <Modal title="Ortak Alan Ekle" onClose={() => setShowAreaModal(false)}>
          <FormField label="Alan Adı"><input style={s.input} value={areaForm.name} onChange={e => setAreaForm({ ...areaForm, name: e.target.value })} placeholder="Toplantı Salonu" /></FormField>
          <FormField label="Kapasite"><input style={s.input} type="number" value={areaForm.capacity} onChange={e => setAreaForm({ ...areaForm, capacity: e.target.value })} /></FormField>
          <FormField label="Açıklama"><input style={s.input} value={areaForm.description} onChange={e => setAreaForm({ ...areaForm, description: e.target.value })} /></FormField>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={s.btnPrimary} onClick={createArea}>Ekle</button>
            <button style={s.btnSecondary} onClick={() => setShowAreaModal(false)}>İptal</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── ZİYARETÇİ ───────────────────────────────────────────────────────────────
function ZiyaretciContent({ buildingId, user, isAdmin }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ visitor_name: '', visitor_phone: '', vehicle_plate: '', visit_date: new Date().toISOString().split('T')[0], expected_arrival: '', notes: '' })
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])

  const load = () => {
    setLoading(true)
    client.get(`/api/visitors?building_id=${buildingId}&date=${dateFilter}`)
      .then(r => setList(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [dateFilter])

  const save = async () => {
    if (!form.visitor_name || !form.visit_date) return
    await client.post('/api/visitors', { ...form, building_id: buildingId })
    setShowModal(false); load()
  }

  const updateStatus = async (id, status) => {
    await client.put(`/api/visitors/${id}`, { status })
    load()
  }

  const statusMap = {
    bekleniyor: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: 'Bekleniyor' },
    iceride:    { bg: 'rgba(59,130,246,0.12)',  color: '#60A5FA', label: 'İçeride' },
    ayrildi:    { bg: 'rgba(16,185,129,0.12)',  color: '#10B981', label: 'Ayrıldı' },
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ color: 'var(--t4)', fontSize: 14 }}>Tarih:</span>
          <input style={{ ...s.input, width: 160 }} type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        </div>
        <button style={s.btnPrimary} onClick={() => setShowModal(true)}>+ Ziyaretçi Ekle</button>
      </div>

      {loading ? <Spinner /> : (
        <div style={s.card}>
          <table style={s.table}>
            <thead><tr>{['Ziyaretçi', 'Daire', 'Araç Plakası', 'Beklenen Saat', 'Durum', 'İşlem'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {list.map(v => (
                <tr key={v.id} style={s.tr}>
                  <td style={s.td}><div style={{ fontWeight: 600, color: 'var(--t1)' }}>{v.visitor_name}</div><div style={{ fontSize: 12, color: 'var(--t5)' }}>{v.visitor_phone}</div></td>
                  <td style={s.td}>{v.unit_number || v.resident_name || '—'}</td>
                  <td style={s.td}>{v.vehicle_plate || '—'}</td>
                  <td style={s.td}>{v.expected_arrival?.slice(0,5) || '—'}</td>
                  <td style={s.td}><StatusPill status={v.status} map={statusMap} /></td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {v.status === 'bekleniyor' && <button style={s.btnPrimary} onClick={() => updateStatus(v.id, 'iceride')}>Girdi</button>}
                      {v.status === 'iceride' && <button style={s.btnSecondary} onClick={() => updateStatus(v.id, 'ayrildi')}>Çıktı</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: 'var(--t5)' }}>Bu tarihte ziyaretçi kaydı yok</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title="Ziyaretçi Ekle" onClose={() => setShowModal(false)}>
          <FormField label="Ziyaretçi Adı"><input style={s.input} value={form.visitor_name} onChange={e => setForm({ ...form, visitor_name: e.target.value })} /></FormField>
          <FormField label="Telefon"><input style={s.input} value={form.visitor_phone} onChange={e => setForm({ ...form, visitor_phone: e.target.value })} /></FormField>
          <FormField label="Araç Plakası"><input style={s.input} value={form.vehicle_plate} onChange={e => setForm({ ...form, vehicle_plate: e.target.value })} placeholder="34 ABC 123" /></FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Ziyaret Tarihi"><input style={s.input} type="date" value={form.visit_date} onChange={e => setForm({ ...form, visit_date: e.target.value })} /></FormField>
            <FormField label="Beklenen Saat"><input style={s.input} type="time" value={form.expected_arrival} onChange={e => setForm({ ...form, expected_arrival: e.target.value })} /></FormField>
          </div>
          <FormField label="Notlar"><input style={s.input} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={s.btnPrimary} onClick={save}>Kaydet</button>
            <button style={s.btnSecondary} onClick={() => setShowModal(false)}>İptal</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── PERSONEL ────────────────────────────────────────────────────────────────
function PersonelContent({ buildingId }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name: '', role: 'kapıcı', phone: '', email: '', start_date: '', salary: '', notes: '' })

  const load = () => {
    setLoading(true)
    client.get(`/api/staff?building_id=${buildingId}`)
      .then(r => setList(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openAdd = () => { setForm({ name: '', role: 'kapıcı', phone: '', email: '', start_date: '', salary: '', notes: '' }); setEditItem(null); setShowModal(true) }
  const openEdit = p => { setForm({ name: p.name, role: p.role, phone: p.phone || '', email: p.email || '', start_date: p.start_date?.split('T')[0] || '', salary: p.salary || '', notes: p.notes || '' }); setEditItem(p); setShowModal(true) }

  const save = async () => {
    if (!form.name || !form.role) return
    if (editItem) await client.put(`/api/staff/${editItem.id}`, { ...form, building_id: buildingId })
    else await client.post('/api/staff', { ...form, building_id: buildingId })
    setShowModal(false); load()
  }

  const deactivate = async id => { if (confirm('Personeli pasif yap?')) { await client.delete(`/api/staff/${id}`); load() } }

  const roles = ['kapıcı', 'güvenlik', 'temizlik', 'bahçıvan', 'teknisyen', 'yönetici', 'diğer']

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button style={s.btnPrimary} onClick={openAdd}>+ Personel Ekle</button>
      </div>
      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {list.map(p => (
            <div key={p.id} style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{p.name.charAt(0)}</div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--t1)' }}>{p.name}</div>
                  <span style={{ ...s.badge, background: 'rgba(59,130,246,0.1)', color: '#60A5FA', fontSize: 12 }}>{p.role}</span>
                </div>
              </div>
              {p.phone && <div style={{ fontSize: 13, color: 'var(--t4)', marginBottom: 4 }}>📞 {p.phone}</div>}
              {p.salary && <div style={{ fontSize: 13, color: 'var(--t4)', marginBottom: 4 }}>₺ {parseFloat(p.salary).toLocaleString('tr-TR')}/ay</div>}
              {p.start_date && <div style={{ fontSize: 12, color: 'var(--t5)' }}>İşe başlama: {new Date(p.start_date).toLocaleDateString('tr-TR')}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button style={{ ...s.btnSecondary, flex: 1 }} onClick={() => openEdit(p)}>Düzenle</button>
                <button style={s.btnDanger} onClick={() => deactivate(p.id)}>Çıkar</button>
              </div>
            </div>
          ))}
          {!list.length && <div style={{ color: 'var(--t5)', padding: 40 }}>Personel kaydı yok</div>}
        </div>
      )}

      {showModal && (
        <Modal title={editItem ? 'Personeli Düzenle' : 'Personel Ekle'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Ad Soyad"><input style={s.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></FormField>
            <FormField label="Görev">
              <select style={s.input} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {roles.map(r => <option key={r}>{r}</option>)}
              </select>
            </FormField>
            <FormField label="Telefon"><input style={s.input} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></FormField>
            <FormField label="E-posta"><input style={s.input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></FormField>
            <FormField label="İşe Başlama"><input style={s.input} type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></FormField>
            <FormField label="Maaş (₺)"><input style={s.input} type="number" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} /></FormField>
          </div>
          <FormField label="Notlar"><textarea style={{ ...s.input, height: 60, resize: 'vertical' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></FormField>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button style={s.btnPrimary} onClick={save}>Kaydet</button>
            <button style={s.btnSecondary} onClick={() => setShowModal(false)}>İptal</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── MESAJLAR ────────────────────────────────────────────────────────────────
function MesajlarContent({ buildingId, user, isAdmin }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [replies, setReplies] = useState([])
  const [newMsg, setNewMsg] = useState({ subject: '', body: '' })
  const [reply, setReply] = useState('')
  const [showNew, setShowNew] = useState(false)

  const load = () => {
    setLoading(true)
    client.get(`/api/messages?building_id=${buildingId}`)
      .then(r => setList(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openThread = async msg => {
    setSelected(msg)
    if (!msg.is_read) { await client.put(`/api/messages/${msg.id}/read`, {}); load() }
    const { data } = await client.get(`/api/messages/${msg.id}/replies`)
    setReplies(data)
  }

  const sendReply = async () => {
    if (!reply.trim()) return
    await client.post('/api/messages', { building_id: buildingId, body: reply, parent_id: selected.id, recipient_id: isAdmin ? selected.sender_id : null })
    setReply(''); openThread(selected)
  }

  const sendNew = async () => {
    if (!newMsg.body.trim()) return
    await client.post('/api/messages', { building_id: buildingId, ...newMsg })
    setShowNew(false); setNewMsg({ subject: '', body: '' }); load()
  }

  const unread = list.filter(m => !m.is_read && m.sender_id !== user.id).length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, height: 'calc(100vh - 200px)' }}>
      <div style={{ ...s.card, overflowY: 'auto', padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--t1)' }}>Mesajlar {unread > 0 && <span style={{ ...s.badge, background: 'rgba(239,68,68,0.15)', color: '#EF4444', marginLeft: 6 }}>{unread}</span>}</span>
          {!isAdmin && <button style={{ ...s.btnPrimary, fontSize: 12, padding: '6px 12px' }} onClick={() => setShowNew(true)}>+ Yeni</button>}
        </div>
        {loading ? <Spinner /> : list.map(msg => (
          <div key={msg.id} onClick={() => openThread(msg)} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-soft)', cursor: 'pointer', background: selected?.id === msg.id ? 'var(--bg-hover)' : 'transparent', borderLeft: !msg.is_read && msg.sender_id !== user.id ? '3px solid #3B82F6' : '3px solid transparent' }}>
            <div style={{ fontWeight: !msg.is_read && msg.sender_id !== user.id ? 700 : 500, color: 'var(--t1)', fontSize: 14 }}>{msg.subject || '(Başlıksız)'}</div>
            <div style={{ fontSize: 12, color: 'var(--t5)', marginTop: 2 }}>{msg.sender_name} · {new Date(msg.created_at).toLocaleDateString('tr-TR')}</div>
            <div style={{ fontSize: 12, color: 'var(--t4)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.body}</div>
          </div>
        ))}
        {!loading && !list.length && <div style={{ padding: 40, color: 'var(--t5)', textAlign: 'center' }}>Mesaj yok</div>}
      </div>

      <div style={{ ...s.card, display: 'flex', flexDirection: 'column' }}>
        {selected ? (
          <>
            <div style={{ fontWeight: 700, color: 'var(--t1)', fontSize: 16, marginBottom: 4 }}>{selected.subject || '(Başlıksız)'}</div>
            <div style={{ fontSize: 12, color: 'var(--t5)', marginBottom: 16 }}>{selected.sender_name} · {new Date(selected.created_at).toLocaleDateString('tr-TR')}</div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: '12px 16px', alignSelf: 'flex-start', maxWidth: '80%' }}>
                <div style={{ fontSize: 12, color: 'var(--t5)', marginBottom: 4 }}>{selected.sender_name}</div>
                <div style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.6 }}>{selected.body}</div>
              </div>
              {replies.map(r => (
                <div key={r.id} style={{ background: r.sender_id === user.id ? 'rgba(59,130,246,0.1)' : 'var(--bg-hover)', borderRadius: 10, padding: '12px 16px', alignSelf: r.sender_id === user.id ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div style={{ fontSize: 12, color: 'var(--t5)', marginBottom: 4 }}>{r.sender_name}</div>
                  <div style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.6 }}>{r.body}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <input style={{ ...s.input, flex: 1 }} placeholder="Yanıt yaz..." value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} />
              <button style={s.btnPrimary} onClick={sendReply}>Gönder</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t5)' }}>Bir mesaj seçin</div>
        )}
      </div>

      {showNew && (
        <Modal title="Yöneticiye Mesaj Gönder" onClose={() => setShowNew(false)}>
          <FormField label="Konu"><input style={s.input} value={newMsg.subject} onChange={e => setNewMsg({ ...newMsg, subject: e.target.value })} /></FormField>
          <FormField label="Mesaj"><textarea style={{ ...s.input, height: 100, resize: 'vertical' }} value={newMsg.body} onChange={e => setNewMsg({ ...newMsg, body: e.target.value })} /></FormField>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={s.btnPrimary} onClick={sendNew}>Gönder</button>
            <button style={s.btnSecondary} onClick={() => setShowNew(false)}>İptal</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── RAPORLAR ────────────────────────────────────────────────────────────────
function RaporlarContent({ buildingId }) {
  const now = new Date()
  const [period, setPeriod] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => {
    setLoading(true)
    client.get(`/api/reports/monthly?building_id=${buildingId}&period=${period}`)
      .then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(load, [period])

  const print = () => {
    if (!data) return
    const months = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    const [y, m] = period.split('-')
    const label = `${months[parseInt(m)]} ${y}`
    const repairRows = Object.entries(data.repairs || {}).map(([status, count]) =>
      `<tr><td>${status}</td><td style="text-align:right;font-weight:600">${count} adet</td></tr>`).join('')
    const expenseRows = (data.expenses.by_category || []).map(c =>
      `<tr><td>${c.category}</td><td style="text-align:right;font-weight:600">₺${parseFloat(c.total).toLocaleString('tr-TR')}</td></tr>`).join('')
    const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>Aylık Rapor — ${label}</title><style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'DM Sans',Arial,sans-serif;color:#1E293B;padding:32px;background:#fff}
      .header{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;padding-bottom:16px;border-bottom:2px solid #E2E8F0}
      .logo-wrap{display:flex;align-items:center;gap:12px}
      .logo-name{font-family:Georgia,serif;font-size:20px;font-weight:800;color:#1E293B;letter-spacing:0.5px}
      .logo-sub{font-size:11px;color:#64748B;margin-top:2px}
      .period-badge{font-size:13px;color:#64748B;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:6px 14px}
      .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px}
      .stat{border:1px solid #E2E8F0;border-radius:10px;padding:16px;text-align:center}
      .stat-val{font-size:26px;font-weight:800}
      .stat-lbl{font-size:12px;color:#64748B;margin-top:4px}
      .green{color:#10B981}.red{color:#EF4444}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
      .box{border:1px solid #E2E8F0;border-radius:10px;padding:16px}
      .box h3{font-size:14px;font-weight:700;margin-bottom:10px;color:#1E293B}
      table{width:100%;border-collapse:collapse;font-size:13px}
      td{padding:6px 0;border-bottom:1px solid #F1F5F9;color:#334155}
      .ann{text-align:center;padding:28px}
      .ann .big{font-size:36px;font-weight:800;color:#1E293B}
      .ann .lbl{font-size:13px;color:#64748B;margin-top:4px}
      @media print{body{padding:16px}@page{margin:10mm}}
    </style></head><body>
      <div class="header">
        <div class="logo-wrap">
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1.5" y="1.5" width="37" height="37" rx="9" fill="rgba(59,130,246,0.12)" stroke="#3B82F6" stroke-width="2"/>
            <line x1="8" y1="10" x2="32" y2="10" stroke="#3B82F6" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="8" y1="14" x2="26" y2="14" stroke="#3B82F6" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
            <text x="20" y="31" text-anchor="middle" fill="#3B82F6" font-size="11.5" font-family="monospace" font-weight="700">&lt;/&gt;</text>
          </svg>
          <div>
            <div class="logo-name">PAAB Yönetim</div>
            <div class="logo-sub">Aylık Yönetim Raporu</div>
          </div>
        </div>
        <div class="period-badge">${label} · ${data.apartments.total} Daire</div>
      </div>
      <div class="stats">
        <div class="stat"><div class="stat-val green">₺${(data.payments.total_income || 0).toLocaleString('tr-TR')}</div><div class="stat-lbl">Toplam Gelir</div></div>
        <div class="stat"><div class="stat-val red">₺${(data.expenses.total || 0).toLocaleString('tr-TR')}</div><div class="stat-lbl">Toplam Gider</div></div>
        <div class="stat"><div class="stat-val ${data.balance >= 0 ? 'green' : 'red'}">₺${(data.balance || 0).toLocaleString('tr-TR')}</div><div class="stat-lbl">Net Bakiye</div></div>
      </div>
      <div class="grid">
        <div class="box"><h3>Aidat Durumu</h3><table>
          <tr><td>Ödenen</td><td style="text-align:right;color:#10B981;font-weight:600">${data.payments.paid?.count || 0} adet · ₺${(data.payments.paid?.total || 0).toLocaleString('tr-TR')}</td></tr>
          <tr><td>Bekleyen</td><td style="text-align:right;color:#F59E0B;font-weight:600">${data.payments.pending?.count || 0} adet · ₺${(data.payments.pending?.total || 0).toLocaleString('tr-TR')}</td></tr>
          <tr><td>Geciken</td><td style="text-align:right;color:#EF4444;font-weight:600">${data.payments.overdue?.count || 0} adet · ₺${(data.payments.overdue?.total || 0).toLocaleString('tr-TR')}</td></tr>
        </table></div>
        <div class="box"><h3>Gider Kategorileri</h3><table>${expenseRows || '<tr><td colspan="2" style="color:#94A3B8;text-align:center;padding:12px">Gider yok</td></tr>'}</table></div>
        <div class="box"><h3>Arıza Özeti</h3><table>${repairRows || '<tr><td colspan="2" style="color:#94A3B8;text-align:center;padding:12px">Arıza yok</td></tr>'}</table></div>
        <div class="box ann"><div class="big">${data.announcements}</div><div class="lbl">Duyuru Gönderildi</div></div>
      </div>
      <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),1000)}<\/script>
    </body></html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    window.open(URL.createObjectURL(blob), '_blank', 'width=900,height=700')
  }

  const months = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
  const [y, m] = period.split('-')
  const periodLabel = `${months[parseInt(m)]} ${y}`

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ color: 'var(--t4)' }}>Dönem:</span>
          <input style={{ ...s.input, width: 160 }} type="month" value={period} onChange={e => setPeriod(e.target.value)} />
        </div>
        <button style={s.btnPrimary} onClick={print}>🖨️ Yazdır / PDF</button>
      </div>

      {loading ? <Spinner /> : data && (
        <div id="report-area">
          <div style={{ ...s.card, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)', fontFamily: 'Syne, sans-serif' }}>Aylık Yönetim Raporu</div>
            <div style={{ color: 'var(--t4)', marginTop: 4 }}>{periodLabel} · {data.apartments.total} Daire</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
            {[
              { label: 'Toplam Gelir', value: `₺${(data.payments.total_income || 0).toLocaleString('tr-TR')}`, color: '#10B981' },
              { label: 'Toplam Gider', value: `₺${(data.expenses.total || 0).toLocaleString('tr-TR')}`, color: '#EF4444' },
              { label: 'Net Bakiye', value: `₺${(data.balance || 0).toLocaleString('tr-TR')}`, color: data.balance >= 0 ? '#10B981' : '#EF4444' },
            ].map(stat => (
              <div key={stat.label} style={{ ...s.card, textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, fontFamily: 'Syne, sans-serif' }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: 'var(--t5)', marginTop: 6 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={s.card}>
              <div style={s.cardTitle}>Aidat Durumu</div>
              {[
                { label: 'Ödenen', val: data.payments.paid, color: '#10B981' },
                { label: 'Bekleyen', val: data.payments.pending, color: '#F59E0B' },
                { label: 'Geciken', val: data.payments.overdue, color: '#EF4444' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-soft)' }}>
                  <span style={{ color: 'var(--t3)' }}>{row.label}</span>
                  <span style={{ color: row.color, fontWeight: 600 }}>{row.val?.count || 0} adet · ₺{(row.val?.total || 0).toLocaleString('tr-TR')}</span>
                </div>
              ))}
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>Gider Kategorileri</div>
              {data.expenses.by_category?.map((cat, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-soft)' }}>
                  <span style={{ color: 'var(--t3)' }}>{cat.category}</span>
                  <span style={{ color: 'var(--t1)', fontWeight: 600 }}>₺{parseFloat(cat.total).toLocaleString('tr-TR')}</span>
                </div>
              ))}
              {!data.expenses.by_category?.length && <div style={{ color: 'var(--t5)', textAlign: 'center', padding: 20 }}>Gider yok</div>}
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>Arıza Özeti</div>
              {Object.entries(data.repairs || {}).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-soft)' }}>
                  <span style={{ color: 'var(--t3)' }}>{status}</span>
                  <span style={{ color: 'var(--t1)', fontWeight: 600 }}>{count} adet</span>
                </div>
              ))}
            </div>

            <div style={{ ...s.card, alignItems: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 40 }}>📣</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--t1)', fontFamily: 'Syne, sans-serif' }}>{data.announcements}</div>
              <div style={{ color: 'var(--t5)', marginTop: 4 }}>Duyuru Gönderildi</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
