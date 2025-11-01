import React from 'react'

export default function PlannerEmptyState() {
  return (
    <div className="planner-empty-state">
      <div className="PlannerEmptyState-styles__title">
        <h2>Your planner is empty</h2>
      </div>
      <div className="PlannerEmptyState-styles__subtitle">
        <p>No items yet — create a course or import one to get started.</p>
      </div>
      <div className="PlannerEmptyState-styles__subtitlebox" style={{marginTop:12}}>
        <ul>
          <li><button onClick={() => alert('Create course (demo)')}>Create course</button></li>
          <li><button onClick={() => alert('Import course (demo)')}>Import</button></li>
        </ul>
      </div>
    </div>
  )
}
