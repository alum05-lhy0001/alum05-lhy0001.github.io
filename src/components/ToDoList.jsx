import React, { useEffect, useState } from 'react'


function ToDoList() {
  const [tasks, setTasks] = useState([])
  const [text, setText] = useState('')

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('tasks')
      if (raw) setTasks(JSON.parse(raw))
    } catch (e) {
      console.error('Failed to load tasks', e)
    }
  }, [])

  // Persist tasks to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks))
    } catch (e) {
      console.error('Failed to save tasks', e)
    }
  }, [tasks])

  function addTask() {
    const title = text.trim()
    if (!title) return
    const newTask = { id: Date.now(), title, completed: false }
    setTasks((t) => [newTask, ...t])
    setText('')
  }

  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')

  function toggleTask(id) {
    setTasks((t) => t.map((task) => task.id === id ? { ...task, completed: !task.completed } : task))
  }

  function deleteTask(id) {
    setTasks((t) => t.filter((task) => task.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setEditingText('')
    }
  }

  function startEditing(task) {
    setEditingId(task.id)
    setEditingText(task.title)
  }

  function saveEdit(id) {
    const title = editingText.trim()
    if (!title) return
    setTasks((t) => t.map((task) => task.id === id ? { ...task, title } : task))
    setEditingId(null)
    setEditingText('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingText('')
  }

  return (
    <div className="todo-container">
      <h2>Task List</h2>
      <div className="input-row">
        <input
          type="text"
          placeholder="Add a new task and press Enter or click Add"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addTask() }}
          aria-label="New task"
        />
        <button onClick={addTask} className="add-btn">Add</button>
      </div>

      <ul className="task-list">
        {tasks.length === 0 && <li className="empty">No tasks yet — add one!</li>}
        {tasks.map((task) => (
          <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
              <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} />

              {editingId === task.id ? (
                <input
                  className="edit-input"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(task.id)
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  autoFocus
                />
              ) : (
                <span className="task-title">{task.title}</span>
              )}
            </div>

            <div className="task-controls">
              {editingId === task.id ? (
                <>
                  <button className="edit-btn save" onClick={() => saveEdit(task.id)}>Save</button>
                  <button className="edit-btn cancel" onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <button className="edit-btn" onClick={() => startEditing(task)} aria-label={`Edit ${task.title}`}>Edit</button>
                  <button className="delete-btn" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`}>×</button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ToDoList
