import { useState, useEffect, useRef } from 'react'
import { getWeddingByCode, writeGuestbook, getGuestbooks } from '../api/api'
import { useParams } from 'react-router-dom'

const themeColors = {
  classic: { accent: '#c9a84c', bg: '#faf6f0', text: '#4a3f2f', sub: '#8a7a65', border: '#e8d5a3', card: '#fff' },
  modern:  { accent: '#1a1a1a', bg: '#f5f5f5', text: '#1a1a1a', sub: '#888', border: '#e0e0e0', card: '#fff' },
  romantic:{ accent: '#d4849a', bg: '#fff5f7', text: '#5c3040', sub: '#b5637a', border: '#f5c6d0', card: '#fff' },
}

const themeFonts = {
  classic: "'Cormorant Garamond', serif",
  modern: "'Montserrat', sans-serif",
  romantic: "'Playfair Display', serif",
}

export default function WeddingPage() {
  const { shareCode } = useParams()
  const [wedding, setWedding] = useState(null)
  const [guestbooks, setGuestbooks] = useState([])
  const [form, setForm] = useState({ guestName: '', message: '' })
  const [isPlaying, setIsPlaying] = useState(false)
  const [copied, setCopied] = useState(null)
  const [daysLeft, setDaysLeft] = useState(null)
  const [fullscreenImage, setFullscreenImage] = useState(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const audioRef = useRef(null)
  const carouselRef = useRef(null)
  const touchStartX = useRef(0)

  useEffect(() => { fetchWedding() }, [])

  const fetchWedding = async () => {
    const res = await getWeddingByCode(shareCode)
    setWedding(res.data)
    const gb = await getGuestbooks(res.data.id)
    setGuestbooks(gb.data)
    if (res.data.weddingDate) {
      const today = new Date()
      const wDate = new Date(res.data.weddingDate)
      const diff = Math.ceil((wDate - today) / (1000 * 60 * 60 * 24))
      setDaysLeft(diff)
    }
  }

  useEffect(() => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.play() : audioRef.current.pause()
    }
  }, [isPlaying])

  // 갤러리 자동 슬라이드
  useEffect(() => {
    if (!wedding) return
    const galleries = getGalleries(wedding)
    if (galleries.length === 0) return
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % galleries.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [wedding])

  const getGalleries = (w) => {
    return [w.gallery1, w.gallery2, w.gallery3, w.gallery4,
            w.gallery5, w.gallery6, w.gallery7, w.gallery8]
      .filter(Boolean)
  }

  const handleWrite = async () => {
    if (!form.guestName || !form.message) {
      alert('이름과 메시지를 입력해주세요.')
      return
    }
    await writeGuestbook(wedding.id, form)
    setForm({ guestName: '', message: '' })
    fetchWedding()
  }

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!wedding) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf6f0' }}>
      <p style={{ fontSize: 13, letterSpacing: '0.3em', color: '#8a7a65' }}>Loading...</p>
    </div>
  )

  const theme = wedding.theme || 'classic'
  const colors = themeColors[theme]
  const font = themeFonts[theme]
  const galleries = getGalleries(wedding)

  return (
    <div style={{ background: colors.bg, fontFamily: font, scrollBehavior: 'smooth' }}>

      {/* BGM */}
      <audio ref={audioRef} loop src="/bgm.mp3" />

      {/* BGM 버튼 — 고정 */}
      <button onClick={() => setIsPlaying(!isPlaying)} style={{
        position: 'fixed', top: 20, right: 20, zIndex: 1000,
        background: 'rgba(255,255,255,0.85)', border: 'none',
        borderRadius: '50%', width: 48, height: 48, fontSize: 20,
        cursor: 'pointer', boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
        backdropFilter: 'blur(8px)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.2s',
      }}>
        {isPlaying ? '🔊' : '🔇'}
      </button>

      {/* ─── 1. 표지 ─── */}
      <section style={{
        minHeight: '100vh', position: 'relative',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* 배경 사진 */}
        {wedding.photoUrl ? (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${wedding.photoUrl})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'brightness(0.55)',
            animation: 'fadeIn 1.5s ease',
          }} />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.border} 100%)`,
          }} />
        )}

        {/* 표지 내용 */}
        <div style={{
          position: 'relative', zIndex: 1,
          textAlign: 'center', padding: '40px 24px',
          animation: 'fadeInUp 1.2s ease',
        }}>
          {/* D-day */}
          {daysLeft !== null && (
            <div style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 24px', marginBottom: 32,
            }}>
              <p style={{
                fontSize: 13, letterSpacing: '0.3em',
                color: wedding.photoUrl ? '#fff' : colors.accent,
              }}>
                {daysLeft > 0 ? `D - ${daysLeft}` : daysLeft === 0 ? 'D - DAY' : `D + ${Math.abs(daysLeft)}`}
              </p>
            </div>
          )}

          <p style={{
            fontSize: 11, letterSpacing: '0.5em', textTransform: 'uppercase',
            color: wedding.photoUrl ? 'rgba(255,255,255,0.75)' : colors.sub,
            marginBottom: 24,
          }}>
            Wedding Invitation
          </p>

          <h1 style={{
            fontSize: 52, fontWeight: 400, letterSpacing: '0.05em',
            color: wedding.photoUrl ? '#fff' : colors.text,
            marginBottom: 20, lineHeight: 1.2,
          }}>
            {wedding.groomName}
            <span style={{ color: colors.accent, fontStyle: 'italic', margin: '0 16px' }}>&</span>
            {wedding.brideName}
          </h1>

          <div style={{ width: 48, height: 1, background: wedding.photoUrl ? 'rgba(255,255,255,0.6)' : colors.accent, margin: '0 auto 20px' }} />

          <p style={{
            fontSize: 14, letterSpacing: '0.3em',
            color: wedding.photoUrl ? 'rgba(255,255,255,0.85)' : colors.sub,
            marginBottom: 8,
          }}>
            {wedding.weddingDate}
          </p>
          <p style={{
            fontSize: 13, letterSpacing: '0.1em',
            color: wedding.photoUrl ? 'rgba(255,255,255,0.7)' : colors.sub,
          }}>
            {wedding.venue}
          </p>
        </div>

        {/* 스크롤 유도 */}
        <div style={{
          position: 'absolute', bottom: 40, left: '50%',
          transform: 'translateX(-50%)', textAlign: 'center',
          animation: 'bounce 2s infinite', zIndex: 1,
        }}>
          <p style={{
            fontSize: 10, letterSpacing: '0.4em', textTransform: 'uppercase',
            color: wedding.photoUrl ? 'rgba(255,255,255,0.6)' : colors.sub,
            marginBottom: 8,
          }}>
            Scroll Down
          </p>
          <div style={{
            width: 1, height: 40,
            background: wedding.photoUrl ? 'rgba(255,255,255,0.4)' : colors.accent,
            margin: '0 auto',
          }} />
        </div>
      </section>

      {/* ─── 2. 인사말 ─── */}
      <section style={{
        padding: '120px 24px', textAlign: 'center',
        background: colors.card, color: colors.text,
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: colors.sub, marginBottom: 40 }}>
            Greeting
          </p>
          <div style={{ width: 40, height: 1, background: colors.accent, margin: '0 auto 48px' }} />
          <p style={{
            fontSize: 18, lineHeight: 2.4, color: colors.text,
            fontStyle: 'italic', whiteSpace: 'pre-line', opacity: 0.9,
          }}>
            {wedding.message ||
              '서로의 마음을 확인하며\n함께 걸어갈 새로운 길 위에 서게 되었습니다.\n\n귀한 걸음으로 축하해 주시면 감사하겠습니다.'}
          </p>
          <div style={{ width: 40, height: 1, background: colors.accent, margin: '48px auto 0' }} />
        </div>
      </section>

      {/* ─── 3. 오시는 길 + 마음 전하는 곳 ─── */}
      <section style={{
        padding: '120px 24px', background: colors.bg, color: colors.text,
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>

          {/* 오시는 길 */}
          <p style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: colors.sub, marginBottom: 40, textAlign: 'center' }}>
            Date & Venue
          </p>

          <div style={{ background: colors.card, padding: 32, marginBottom: 24, boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: 22, fontWeight: 400, color: colors.text, marginBottom: 8, textAlign: 'center' }}>
              {wedding.venue}
            </p>
            {wedding.venue2 && (
              <p style={{ fontSize: 13, color: colors.sub, textAlign: 'center', marginBottom: 16 }}>
                {wedding.venue2}
              </p>
            )}
            <p style={{ fontSize: 14, letterSpacing: '0.2em', color: colors.sub, textAlign: 'center', marginBottom: 20 }}>
              {wedding.weddingDate}
            </p>
            {wedding.mapUrl && (
              <div style={{ textAlign: 'center' }}>
                <a href={wedding.mapUrl} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-block', padding: '12px 28px',
                  background: colors.accent, color: '#fff',
                  fontSize: 12, letterSpacing: '0.2em', textDecoration: 'none',
                }}>
                  📍 지도 보기
                </a>
              </div>
            )}
          </div>

          {/* 마음 전하는 곳 */}
          {(wedding.groomPhone || wedding.bridePhone || wedding.groomAccount || wedding.brideAccount) && (
            <>
              <p style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: colors.sub, margin: '48px 0 24px', textAlign: 'center' }}>
                Contact & Account
              </p>

              {/* 신랑 */}
              {(wedding.groomPhone || wedding.groomAccount) && (
                <div style={{ background: colors.card, padding: 24, marginBottom: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', borderLeft: `3px solid ${colors.accent}` }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: colors.text, marginBottom: 16 }}>
                    👦 신랑 {wedding.groomName}
                  </p>
                  {wedding.groomPhone && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <p style={{ fontSize: 13, color: colors.sub }}>📞 {wedding.groomPhone}</p>
                      <a href={`tel:${wedding.groomPhone}`} style={{
                        padding: '6px 16px', fontSize: 11, letterSpacing: '0.1em',
                        border: `1px solid ${colors.border}`, color: colors.text,
                        textDecoration: 'none', background: 'transparent',
                      }}>전화하기</a>
                    </div>
                  )}
                  {wedding.groomAccount && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: 13, color: colors.sub }}>💳 {wedding.groomAccount}</p>
                      <button onClick={() => handleCopy(wedding.groomAccount, 'groom')} style={{
                        padding: '6px 16px', fontSize: 11, letterSpacing: '0.1em',
                        background: copied === 'groom' ? colors.accent : 'transparent',
                        border: `1px solid ${colors.accent}`,
                        color: copied === 'groom' ? '#fff' : colors.accent,
                        cursor: 'pointer',
                      }}>
                        {copied === 'groom' ? '✅ 복사됨' : '💳 계좌 복사'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 신부 */}
              {(wedding.bridePhone || wedding.brideAccount) && (
                <div style={{ background: colors.card, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', borderLeft: `3px solid ${colors.accent}` }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: colors.text, marginBottom: 16 }}>
                    👰 신부 {wedding.brideName}
                  </p>
                  {wedding.bridePhone && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <p style={{ fontSize: 13, color: colors.sub }}>📞 {wedding.bridePhone}</p>
                      <a href={`tel:${wedding.bridePhone}`} style={{
                        padding: '6px 16px', fontSize: 11, letterSpacing: '0.1em',
                        border: `1px solid ${colors.border}`, color: colors.text,
                        textDecoration: 'none', background: 'transparent',
                      }}>전화하기</a>
                    </div>
                  )}
                  {wedding.brideAccount && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: 13, color: colors.sub }}>💳 {wedding.brideAccount}</p>
                      <button onClick={() => handleCopy(wedding.brideAccount, 'bride')} style={{
                        padding: '6px 16px', fontSize: 11, letterSpacing: '0.1em',
                        background: copied === 'bride' ? colors.accent : 'transparent',
                        border: `1px solid ${colors.accent}`,
                        color: copied === 'bride' ? '#fff' : colors.accent,
                        cursor: 'pointer',
                      }}>
                        {copied === 'bride' ? '✅ 복사됨' : '💳 계좌 복사'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <p style={{ fontSize: 12, color: colors.sub, textAlign: 'center', marginTop: 20, fontStyle: 'italic' }}>
                환경 보호를 위해 화환은 정중히 사양합니다
              </p>
            </>
          )}
        </div>
      </section>

      {/* ─── 4. 사진 갤러리 ─── */}
      {galleries.length > 0 && (
        <section style={{ padding: '120px 24px', background: colors.card, textAlign: 'center' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: colors.sub, marginBottom: 48 }}>
            Gallery
          </p>

          {/* 슬라이드 */}
          <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto', overflow: 'hidden', borderRadius: 2 }}>
            <div style={{
              display: 'flex',
              transform: `translateX(-${carouselIndex * 100}%)`,
              transition: 'transform 0.7s ease',
            }}>
              {galleries.map((src, i) => (
                <img key={i} src={src} alt={`gallery-${i}`}
                  onClick={() => setFullscreenImage(src)}
                  style={{
                    width: '100%', flexShrink: 0,
                    aspectRatio: '4/3', objectFit: 'cover',
                    cursor: 'pointer',
                  }}
                  onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
                  onTouchEnd={(e) => {
                    const diff = touchStartX.current - e.changedTouches[0].clientX
                    if (diff > 50) setCarouselIndex(prev => Math.min(prev + 1, galleries.length - 1))
                    else if (diff < -50) setCarouselIndex(prev => Math.max(prev - 1, 0))
                  }}
                />
              ))}
            </div>

            {/* 이전/다음 버튼 */}
            <button onClick={() => setCarouselIndex(prev => (prev - 1 + galleries.length) % galleries.length)}
              style={{
                position: 'absolute', top: '50%', left: 12,
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.8)', border: 'none',
                borderRadius: '50%', width: 36, height: 36,
                cursor: 'pointer', fontSize: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>◀</button>
            <button onClick={() => setCarouselIndex(prev => (prev + 1) % galleries.length)}
              style={{
                position: 'absolute', top: '50%', right: 12,
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.8)', border: 'none',
                borderRadius: '50%', width: 36, height: 36,
                cursor: 'pointer', fontSize: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>▶</button>
          </div>

          {/* 인디케이터 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
            {galleries.map((_, i) => (
              <div key={i} onClick={() => setCarouselIndex(i)} style={{
                width: i === carouselIndex ? 20 : 6, height: 6,
                background: i === carouselIndex ? colors.accent : colors.border,
                borderRadius: 3, cursor: 'pointer',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox */}
      {fullscreenImage && (
        <div onClick={() => setFullscreenImage(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, animation: 'fadeIn 0.3s ease',
        }}>
          <img src={fullscreenImage} alt="fullscreen" style={{
            maxHeight: '90vh', maxWidth: '90vw',
            borderRadius: 2, boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
            animation: 'zoomIn 0.3s ease',
          }} />
          <button onClick={() => setFullscreenImage(null)} style={{
            position: 'absolute', top: 20, right: 20,
            background: 'transparent', border: 'none',
            color: '#fff', fontSize: 28, cursor: 'pointer',
          }}>✕</button>
        </div>
      )}

      {/* ─── 5. 방명록 ─── */}
      <section id="guestbook" style={{
        padding: '120px 24px', background: colors.bg, color: colors.text,
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: colors.sub, marginBottom: 48, textAlign: 'center' }}>
            Guestbook
          </p>
          <p style={{ fontSize: 13, color: colors.sub, textAlign: 'center', marginBottom: 32 }}>
            축하 메시지를 남겨주세요 💌
          </p>

          {/* 작성 폼 */}
          <div style={{ background: colors.card, padding: 28, marginBottom: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
            <input placeholder="이름" value={form.guestName}
              onChange={(e) => setForm({ ...form, guestName: e.target.value })}
              style={{
                width: '100%', padding: '12px 16px',
                border: `1px solid ${colors.border}`, background: colors.bg,
                color: colors.text, fontFamily: font, fontSize: 13,
                outline: 'none', marginBottom: 12, boxSizing: 'border-box',
              }} />
            <textarea placeholder="축하 메시지를 남겨주세요" rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              style={{
                width: '100%', padding: '12px 16px',
                border: `1px solid ${colors.border}`, background: colors.bg,
                color: colors.text, fontFamily: font, fontSize: 13,
                outline: 'none', resize: 'none', marginBottom: 12,
                boxSizing: 'border-box',
              }} />
            <button onClick={handleWrite} style={{
              width: '100%', padding: 14, background: colors.accent,
              color: '#fff', border: 'none', fontSize: 12,
              letterSpacing: '0.2em', cursor: 'pointer', fontFamily: font,
            }}>
              방명록 남기기
            </button>
          </div>

          {/* 방명록 목록 */}
          {guestbooks.length === 0 ? (
            <p style={{ textAlign: 'center', color: colors.sub, fontSize: 13, padding: 40 }}>
              아직 방명록이 없어요. 첫 번째로 축하해주세요! 🎉
            </p>
          ) : (
            guestbooks.map((g) => (
              <div key={g.id} style={{
                background: colors.card, padding: '20px 24px',
                marginBottom: 12, borderLeft: `3px solid ${colors.accent}`,
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: colors.text, marginBottom: 6 }}>{g.guestName}</p>
                <p style={{ fontSize: 13, color: colors.sub, lineHeight: 1.7 }}>{g.message}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 애니메이션 */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-8px); }
        }
        @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  )
}