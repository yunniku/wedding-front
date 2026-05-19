import { useState, useEffect, useRef } from 'react'
import { getWeddings, createWedding, updateWedding, deleteWedding } from '../api/api'
import { useNavigate } from 'react-router-dom'

const THEMES = [
  { id: 'classic', label: 'Classic', desc: '크림 / 골드', previewClass: 'preview-classic' },
  { id: 'modern', label: 'Modern', desc: '화이트 / 블랙', previewClass: 'preview-modern' },
  { id: 'romantic', label: 'Romantic', desc: '핑크 / 로즈', previewClass: 'preview-romantic' },
]

const themeColors = {
  classic: { accent: '#c9a84c', bg: '#faf6f0', text: '#4a3f2f', sub: '#8a7a65', border: '#e8d5a3' },
  modern:  { accent: '#1a1a1a', bg: '#f5f5f5', text: '#1a1a1a', sub: '#888888', border: '#e0e0e0' },
  romantic:{ accent: '#d4849a', bg: '#fff5f7', text: '#5c3040', sub: '#b5637a', border: '#f5c6d0' },
}

const emptyForm = {
  groomName: '', brideName: '',
  weddingDate: '', venue: '', venue2: '',
  message: '',
  groomPhone: '', bridePhone: '',
  groomAccount: '', brideAccount: '',
  mapUrl: '', photoUrl: '',
  photoOrientation: 'landscape',
  gallery1: '', gallery2: '', gallery3: '', gallery4: '',
  gallery5: '', gallery6: '', gallery7: '', gallery8: '',
}

export default function DashboardPage() {
  const [weddings, setWeddings] = useState([])
  const [selectedTheme, setSelectedTheme] = useState('classic')
  const [checked, setChecked] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [galleryPreviews, setGalleryPreviews] = useState([])
  const fileRef = useRef()
  const galleryRef = useRef()
  const [form, setForm] = useState(emptyForm)
  const navigate = useNavigate()

  useEffect(() => { fetchWeddings() }, [])

  const fetchWeddings = async () => {
    const res = await getWeddings()
    setWeddings(res.data)
    setChecked([])
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setPhotoPreview(null)
    setGalleryPreviews([])
    setSelectedTheme('classic')
    setShowPreview(false)
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhotoPreview(ev.target.result)
      setForm(prev => ({ ...prev, photoUrl: ev.target.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 8)
    if (files.length < 6) {
      alert('사진을 최소 6장 선택해주세요.')
      return
    }
    const previews = new Array(files.length)
    const galleryData = {}
    let loaded = 0
    files.forEach((file, i) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        previews[i] = ev.target.result
        galleryData[`gallery${i + 1}`] = ev.target.result
        loaded++
        if (loaded === files.length) {
          setGalleryPreviews([...previews])
          setForm(prev => ({ ...prev, ...galleryData }))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleCreate = async () => {
    if (!form.groomName || !form.brideName || !form.weddingDate || !form.venue) {
      alert('필수 항목을 입력해주세요.')
      return
    }
    await createWedding({ ...form, theme: selectedTheme }, 1)
    alert('청첩장이 생성됐어요!')
    resetForm()
    fetchWeddings()
  }

  const handleEdit = (w) => {
    setEditingId(w.id)
    setSelectedTheme(w.theme || 'classic')
    setPhotoPreview(w.photoUrl || null)
    setGalleryPreviews([w.gallery1, w.gallery2, w.gallery3, w.gallery4,
      w.gallery5, w.gallery6, w.gallery7, w.gallery8].filter(Boolean))
    setForm({
      groomName: w.groomName || '',
      brideName: w.brideName || '',
      weddingDate: w.weddingDate || '',
      venue: w.venue || '',
      venue2: w.venue2 || '',
      message: w.message || '',
      groomPhone: w.groomPhone || '',
      bridePhone: w.bridePhone || '',
      groomAccount: w.groomAccount || '',
      brideAccount: w.brideAccount || '',
      mapUrl: w.mapUrl || '',
      photoUrl: w.photoUrl || '',
      photoOrientation: w.photoOrientation || 'landscape',
      gallery1: w.gallery1 || '', gallery2: w.gallery2 || '',
      gallery3: w.gallery3 || '', gallery4: w.gallery4 || '',
      gallery5: w.gallery5 || '', gallery6: w.gallery6 || '',
      gallery7: w.gallery7 || '', gallery8: w.gallery8 || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleUpdate = async () => {
    if (!form.groomName || !form.brideName || !form.weddingDate || !form.venue) {
      alert('필수 항목을 입력해주세요.')
      return
    }
    await updateWedding(editingId, { ...form, theme: selectedTheme })
    alert('수정 완료!')
    resetForm()
    fetchWeddings()
  }

  const handleCheck = (id) => {
    setChecked(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  const handleDeleteSelected = async () => {
    if (checked.length === 0) return alert('삭제할 청첩장을 선택해주세요.')
    if (!window.confirm(`선택한 ${checked.length}개를 삭제할까요?`)) return
    await Promise.all(checked.map(id => deleteWedding(id)))
    fetchWeddings()
  }

  const handleDeleteAll = async () => {
    if (weddings.length === 0) return alert('삭제할 청첩장이 없어요.')
    if (!window.confirm(`전체 ${weddings.length}개를 모두 삭제할까요?`)) return
    await Promise.all(weddings.map(w => deleteWedding(w.id)))
    fetchWeddings()
  }

  const handleDelete = async (id) => {
    if (window.confirm('삭제할까요?')) {
      await deleteWedding(id)
      fetchWeddings()
    }
  }

  const colors = themeColors[selectedTheme]

  const label = (text) => (
    <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8a7a65', marginBottom: 8, marginTop: 20 }}>
      {text}
    </p>
  )

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>💍 Eternal</h1>
        <span>내 청첩장 관리</span>
      </div>

      {/* ── 청첩장 만들기/수정 폼 ── */}
      <div className="create-form">
        <h2>{editingId ? '✏️ 청첩장 수정하기' : '새 청첩장 만들기'}</h2>

        {/* 1. BGM */}
        {label('배경음악 (BGM)')}
        <button onClick={() => alert('BGM 설정은 추후 업데이트 예정입니다 🎵')} style={{
          width: '100%', padding: 14, background: 'transparent',
          border: '2px dashed #e8d5a3', color: '#8a7a65',
          fontSize: 13, cursor: 'pointer', borderRadius: 4, marginBottom: 4,
        }}>
          🎵 BGM 선택 (추후 업데이트 예정)
        </button>

        {/* 2. 대표 사진 */}
        {label('대표 사진 (표지용)')}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[
            { id: 'landscape', label: '🖼 가로형', desc: '와이드' },
            { id: 'portrait', label: '📱 세로형', desc: '세로' },
          ].map((o) => (
            <div key={o.id}
              onClick={() => setForm(prev => ({ ...prev, photoOrientation: o.id }))}
              style={{
                flex: 1, padding: '10px 0', textAlign: 'center',
                border: `2px solid ${form.photoOrientation === o.id ? '#c9a84c' : '#e8d5a3'}`,
                background: form.photoOrientation === o.id ? '#fffbf4' : '#faf6f0',
                cursor: 'pointer', borderRadius: 4, transition: 'all 0.2s',
              }}>
              <p style={{ fontSize: 14 }}>{o.label}</p>
              <p style={{ fontSize: 10, color: '#8a7a65', marginTop: 2 }}>{o.desc}</p>
            </div>
          ))}
        </div>
        <div onClick={() => fileRef.current.click()} style={{
          width: '100%',
          height: form.photoOrientation === 'portrait' ? 320 : 200,
          border: '2px dashed #e8d5a3', borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', background: photoPreview ? 'none' : '#faf6f0',
          overflow: 'hidden', marginBottom: 4, transition: 'height 0.3s',
        }}>
          {photoPreview
            ? <img src={photoPreview} alt="preview" style={{
                width: '100%', height: '100%',
                objectFit: form.photoOrientation === 'portrait' ? 'cover' : 'contain',
              }} />
            : <p style={{ color: '#8a7a65', fontSize: 13 }}>📷 클릭해서 대표 사진 업로드</p>
          }
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/avif,image/png,image/webp" style={{ display: 'none' }} onChange={handlePhotoChange} />

        {/* 3. 기본 정보 */}
        {label('기본 정보 *')}
        <div className="form-row">
          <input placeholder="신랑 이름 *" value={form.groomName}
            onChange={(e) => setForm({ ...form, groomName: e.target.value })} />
          <input placeholder="신부 이름 *" value={form.brideName}
            onChange={(e) => setForm({ ...form, brideName: e.target.value })} />
        </div>
        <div className="form-row">
          <input type="date" value={form.weddingDate}
            onChange={(e) => setForm({ ...form, weddingDate: e.target.value })} />
          <input placeholder="예식장 이름 *" value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })} />
        </div>
        <input placeholder="상세 주소" value={form.venue2}
          onChange={(e) => setForm({ ...form, venue2: e.target.value })} />
        <input placeholder="지도 링크 (네이버/카카오 지도 URL)" value={form.mapUrl}
          onChange={(e) => setForm({ ...form, mapUrl: e.target.value })} />
        <textarea placeholder="청첩장 메시지 (인사말)" rows={3} value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          style={{ marginBottom: 4 }} />

        {/* 4. 연락처 */}
        {label('연락처')}
        <div className="form-row">
          <input placeholder="신랑 연락처" value={form.groomPhone}
            onChange={(e) => setForm({ ...form, groomPhone: e.target.value })} />
          <input placeholder="신부 연락처" value={form.bridePhone}
            onChange={(e) => setForm({ ...form, bridePhone: e.target.value })} />
        </div>

        {/* 5. 계좌번호 */}
        {label('계좌번호')}
        <input placeholder="신랑 계좌번호 (예: 신한 110-123-456789)" value={form.groomAccount}
          onChange={(e) => setForm({ ...form, groomAccount: e.target.value })} />
        <input placeholder="신부 계좌번호 (예: 국민 123456-78-987654)" value={form.brideAccount}
          onChange={(e) => setForm({ ...form, brideAccount: e.target.value })} />

        {/* 6. 갤러리 사진 */}
        {label('갤러리 사진 (6~8장)')}
        <div onClick={() => galleryRef.current.click()} style={{
          width: '100%', border: '2px dashed #e8d5a3', borderRadius: 4,
          padding: 16, cursor: 'pointer', background: '#faf6f0', marginBottom: 4,
        }}>
          {galleryPreviews.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {galleryPreviews.map((src, i) => (
                <img key={i} src={src} alt={`g-${i}`}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 2 }} />
              ))}
            </div>
          ) : (
            <p style={{ color: '#8a7a65', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              📸 클릭해서 갤러리 사진 선택 (6~8장)
            </p>
          )}
        </div>
        <input ref={galleryRef} type="file" accept="image/jpeg,image/jpg,image/avif,image/png,image/webp" multiple style={{ display: 'none' }} onChange={handleGalleryChange} />

        {/* 7. 테마 선택 */}
        {label(`테마 선택 — 현재: ${selectedTheme}`)}
        <div className="theme-selector">
          {THEMES.map((t) => (
            <div key={t.id}
              className={`theme-option ${selectedTheme === t.id ? 'selected' : ''}`}
              onClick={() => setSelectedTheme(t.id)}>
              <div className={`theme-preview ${t.previewClass}`} />
              <span>{t.label}</span>
              <p style={{ fontSize: 10, color: '#8a7a65', marginTop: 4 }}>{t.desc}</p>
            </div>
          ))}
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button onClick={() => setShowPreview(true)} style={{
            flex: 1, padding: 14, background: 'transparent',
            border: '1px solid #c9a84c', color: '#c9a84c',
            fontSize: 12, letterSpacing: '0.15em', cursor: 'pointer',
          }}>
            미리보기
          </button>
          {editingId ? (
            <>
              <button className="create-btn" style={{ flex: 2 }} onClick={handleUpdate}>
                ✅ 수정 완료
              </button>
              <button onClick={resetForm} style={{
                flex: 1, padding: 14, background: 'transparent',
                border: '1px solid #888', color: '#888',
                fontSize: 12, letterSpacing: '0.15em', cursor: 'pointer',
              }}>
                취소
              </button>
            </>
          ) : (
            <button className="create-btn" style={{ flex: 2 }} onClick={handleCreate}>
              청첩장 생성
            </button>
          )}
        </div>
      </div>

      {/* ── 청첩장 목록 ── */}
      <div className="wedding-list">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>내 청첩장 목록</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-view" onClick={handleDeleteSelected}
              style={{ padding: '8px 16px', fontSize: 11 }}>
              선택 삭제 ({checked.length})
            </button>
            <button className="btn-del" onClick={handleDeleteAll}
              style={{ padding: '8px 16px', fontSize: 11 }}>
              전체 삭제
            </button>
          </div>
        </div>

        {weddings.length === 0 ? (
          <div className="empty-state">아직 만든 청첩장이 없어요</div>
        ) : (
          weddings.map((w) => (
            <div key={w.id} className="wedding-card"
              style={{ border: checked.includes(w.id) ? '2px solid #c9a84c' : '1px solid #e8d5a3' }}>
              <input type="checkbox" checked={checked.includes(w.id)}
                onChange={() => handleCheck(w.id)}
                style={{ width: 18, height: 18, marginRight: 16, cursor: 'pointer', accentColor: '#c9a84c' }} />
              {w.photoUrl && (
                <img src={w.photoUrl} alt="thumb"
                  style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 2, marginRight: 16 }} />
              )}
              <div className="wedding-card-info" style={{ flex: 1 }}>
                <h3>{w.groomName} <span style={{ color: '#c9a84c', fontStyle: 'italic' }}>♥</span> {w.brideName}</h3>
                <p>📅 {w.weddingDate} &nbsp;|&nbsp; 📍 {w.venue}</p>
                <p>🎨 {w.theme === 'modern' ? 'Modern' : w.theme === 'romantic' ? 'Romantic' : 'Classic'}</p>
                <span className="share-code">🔗 {w.shareCode}</span>
                <span className="share-code">🔗 {w.shareCode}</span>
                <button onClick={() => {
                    const url = `https://wedding-front-j18dwh6if-yunnikus-projects.vercel.app/w/${w.shareCode}`
                    navigator.clipboard.writeText(url)
                    alert('공유 링크가 복사됐어요! 하객들에게 보내주세요 💌')
                    }} style={{
                    marginTop: 6, padding: '6px 14px', fontSize: 11,
                    background: 'transparent', border: '1px solid #c9a84c',
                    color: '#c9a84c', cursor: 'pointer', letterSpacing: '0.1em',
                    display: 'block',
                }}>
                    🔗 공유 링크 복사
                </button>
              </div>
              <div className="wedding-card-actions">
                <button className="btn-view" onClick={() => navigate(`/w/${w.shareCode}`)}>보기</button>
                <button style={{
                  padding: '10px 16px', fontSize: 11, letterSpacing: '0.1em',
                  background: 'transparent', border: '1px solid #c9a84c',
                  color: '#c9a84c', cursor: 'pointer',
                }} onClick={() => handleEdit(w)}>수정</button>
                <button className="btn-del" onClick={() => handleDelete(w.id)}>삭제</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── 미리보기 모달 ── */}
      {showPreview && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          zIndex: 1000, display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: 24, overflowY: 'auto',
        }}>
          <div style={{
            background: colors.bg, maxWidth: 480, width: '100%',
            maxHeight: '90vh', overflowY: 'auto', borderRadius: 4,
            position: 'relative',
          }}>
            <button onClick={() => setShowPreview(false)} style={{
              position: 'sticky', top: 0, float: 'right', margin: '12px 12px 0 0',
              background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff',
              width: 32, height: 32, borderRadius: '50%',
              cursor: 'pointer', fontSize: 16, zIndex: 10,
            }}>✕</button>

            {photoPreview && (
              <img src={photoPreview} alt="cover"
                style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
            )}

            <div style={{ padding: '48px 36px', textAlign: 'center' }}>
              <p style={{ fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase', color: colors.sub, marginBottom: 24 }}>
                Wedding Invitation
              </p>
              <h2 style={{ fontSize: 34, fontWeight: 400, color: colors.text, marginBottom: 16 }}>
                {form.groomName || '신랑'}
                <span style={{ color: colors.accent, fontStyle: 'italic', margin: '0 12px' }}>&</span>
                {form.brideName || '신부'}
              </h2>
              <div style={{ width: 40, height: 1, background: colors.accent, margin: '0 auto 16px' }} />
              <p style={{ fontSize: 13, letterSpacing: '0.25em', color: colors.sub, marginBottom: 6 }}>
                {form.weddingDate || 'YYYY-MM-DD'}
              </p>
              <p style={{ fontSize: 13, color: colors.sub, marginBottom: 4 }}>{form.venue}</p>
              {form.venue2 && <p style={{ fontSize: 12, color: colors.sub, marginBottom: 4 }}>{form.venue2}</p>}
              {form.message && (
                <p style={{ fontStyle: 'italic', fontSize: 14, color: colors.text, margin: '24px 0', lineHeight: 1.9, opacity: 0.85, whiteSpace: 'pre-line' }}>
                  "{form.message}"
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
                <div style={{ flex: 1, height: 1, background: colors.border }} />
                <span style={{ color: colors.accent }}>✦</span>
                <div style={{ flex: 1, height: 1, background: colors.border }} />
              </div>
              {(form.groomPhone || form.bridePhone) && (
                <div style={{ textAlign: 'left', marginBottom: 20 }}>
                  <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: colors.sub, marginBottom: 10 }}>연락처</p>
                  {form.groomPhone && <p style={{ fontSize: 13, color: colors.text, marginBottom: 6 }}>👦 {form.groomName}: {form.groomPhone}</p>}
                  {form.bridePhone && <p style={{ fontSize: 13, color: colors.text }}>👰 {form.brideName}: {form.bridePhone}</p>}
                </div>
              )}
              {(form.groomAccount || form.brideAccount) && (
                <div style={{ textAlign: 'left', marginBottom: 20 }}>
                  <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: colors.sub, marginBottom: 10 }}>마음 전하는 곳</p>
                  {form.groomAccount && <p style={{ fontSize: 13, color: colors.text, marginBottom: 6 }}>👦 {form.groomName}: {form.groomAccount}</p>}
                  {form.brideAccount && <p style={{ fontSize: 13, color: colors.text }}>👰 {form.brideName}: {form.brideAccount}</p>}
                </div>
              )}
              {galleryPreviews.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: colors.sub, marginBottom: 12 }}>Gallery</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {galleryPreviews.map((src, i) => (
                      <img key={i} src={src} alt={`g-${i}`}
                        style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 2 }} />
                    ))}
                  </div>
                </div>
              )}
              {form.mapUrl && (
                <p style={{ fontSize: 12, color: colors.sub, marginBottom: 20 }}>📍 지도 링크 포함</p>
              )}
              <button onClick={editingId ? handleUpdate : handleCreate} style={{
                width: '100%', padding: 14, background: colors.accent,
                color: '#fff', border: 'none', fontSize: 12,
                letterSpacing: '0.2em', cursor: 'pointer', marginTop: 8,
              }}>
                {editingId ? '이대로 수정하기' : '이대로 생성하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}