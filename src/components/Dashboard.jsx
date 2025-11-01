import React from 'react'
import PlannerEmptyState from './PlannerEmptyState'
import dashboardImg from '../assets/dashboard_jpg.jpg'

export default function Dashboard() {
  const style = {
    minHeight: 'calc(100vh - 64px)', // leave room for nav
    backgroundImage: `url(${dashboardImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    padding: '16px',
  }

  return (
    <div style={style}>
      <h2>Dashboard</h2>
      <PlannerEmptyState />
    </div>
  )
}
