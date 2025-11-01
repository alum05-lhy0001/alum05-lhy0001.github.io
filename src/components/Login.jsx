import React, { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Sign in to NewCanvas (demo)</h2>
        <label>
          Email
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
        </label>
        <div style={{marginTop:12}}>
          <button className="btn-primary" onClick={() => alert('Demo sign in: ' + email)}>Sign in</button>
        </div>
        <p className="muted">This is a placeholder login. Replace with real auth flows for production.</p>
      </div>
    </div>
  )
}
