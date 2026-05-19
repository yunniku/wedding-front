import { useState } from 'react'
import { register } from '../api/api'
import { useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const navigate = useNavigate()

  const handleRegister = async () => {
    try {
      await register({ email, password, name })
      alert('회원가입 성공! 로그인해주세요.')
      navigate('/')
    } catch (e) {
      alert('이미 사용중인 이메일입니다.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <h1>💍 Eternal</h1>
          <p>Wedding Invitation Platform</p>
        </div>

        <p className="auth-title">회원가입</p>

        <input
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
        />

        <button className="auth-btn" onClick={handleRegister}>
          회원가입
        </button>
        <button className="auth-btn-outline" onClick={() => navigate('/')}>
          로그인으로 돌아가기
        </button>
      </div>
    </div>
  )
}