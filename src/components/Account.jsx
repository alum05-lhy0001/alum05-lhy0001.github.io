import React from 'react'

export default function Account() {
  return (
    <div className="account-page">
      <div className="auth-card">
        <h2>Account</h2>
        <p className="muted">This is a demo account page. Replace with real account data.</p>
        <div style={{marginTop:8}}>
          <div><strong>Name:</strong> Demo User</div>
          <div><strong>Email:</strong> demo@example.com</div>
        </div>
        <div style={{marginTop:12}}>
          <button className="btn-primary" onClick={() => alert('Signed out (demo)')}>Sign out</button>
        </div>
      </div>
    </div>
  )
}
