import { useState } from 'react'
import { login } from '../api/api'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      await login({ email, password })
      localStorage.setItem('userEmail', email)
      navigate('/dashboard')
    } catch (e) {
      alert('이메일 또는 비밀번호가 틀렸습니다.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <h1>💍 Eternal</h1>
          <p>Wedding Invitation Platform</p>
        </div>

        <p className="auth-title">로그인</p>

        <input
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />

        <button className="auth-btn" onClick={handleLogin}>
          로그인
        </button>
        <button className="auth-btn-outline" onClick={() => navigate('/register')}>
          회원가입
        </button>

        <p className="auth-link">
          아직 계정이 없으신가요?
        </p>
      </div>
    </div>
  )
}