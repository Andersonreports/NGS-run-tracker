import React, { useState, useEffect } from 'react'
import InputSection from './components/InputSection'
import ViewSection from './components/ViewSection'

const STORAGE_KEY = 'ngs_runs_v1'

function App() {
  const [activeTab, setActiveTab] = useState('view')
  const [runs, setRuns] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setRuns(JSON.parse(saved))
    } catch (e) {
      console.error('Failed to load saved runs:', e)
    }
  }, [])

  const saveRun = (newRun) => {
    setRuns(prev => {
      // Replace if same run_id, otherwise append
      const exists = prev.findIndex(r => r.run_id === newRun.run_id)
      const updated = exists >= 0
        ? prev.map((r, i) => i === exists ? newRun : r)
        : [newRun, ...prev]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
    setActiveTab('view')
  }

  return (
    <div className="app-container">
      <header>
        <div>
          <h1>NGS Run Directory</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Anderson Diagnostics · Sequencing Sample Management
          </p>
        </div>
        <div className="search-container">
          <svg
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-secondary)', pointerEvents: 'none' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by Run ID, Library, Date…"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`} onClick={() => setActiveTab('view')}>
          Browse Records
        </button>
        <button className={`tab-btn ${activeTab === 'input' ? 'active' : ''}`} onClick={() => setActiveTab('input')}>
          New Entry
        </button>
      </div>

      <main>
        {activeTab === 'view'
          ? <ViewSection runs={runs} searchQuery={searchQuery} />
          : <InputSection onSave={saveRun} />
        }
      </main>
    </div>
  )
}

export default App
