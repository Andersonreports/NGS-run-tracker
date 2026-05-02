import React, { useState } from 'react'

const ViewSection = ({ runs, searchQuery }) => {
  const [expandedRun, setExpandedRun] = useState(null)

  const q = searchQuery.toLowerCase()
  const filtered = runs.filter(run =>
    run.run_id.toLowerCase().includes(q) ||
    run.instrument.toLowerCase().includes(q) ||
    run.date.includes(q) ||
    run.flowcell.toLowerCase().includes(q) ||
    run.libraries.some(l =>
      l.name.toLowerCase().includes(q) ||
      (l.remarks && l.remarks.toLowerCase().includes(q))
    )
  )

  if (runs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 2rem', border: '2px dashed var(--border-color)', borderRadius: '1rem' }}>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No runs recorded yet.</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Switch to <strong>New Entry</strong> to add the first run.</p>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        No records match <strong>"{searchQuery}"</strong>
      </div>
    )
  }

  return (
    <div className="run-grid">
      {filtered.map((run, idx) => {
        const totalSamples = run.libraries.reduce((s, l) => s + l.samples, 0)
        const totalReads   = run.libraries.reduce((s, l) => s + l.reads,   0)
        const isOpen = expandedRun === run.run_id
        const activeLibs = run.libraries.filter(l => l.samples > 0)

        return (
          <div key={idx} className="card run-card fade-in" style={{ animationDelay: `${idx * 0.04}s` }}>

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div className="run-id">{run.run_id}</div>
              <span className="badge-active">Active</span>
            </div>

            <div className="run-meta">
              <span>{run.date}</span><span>·</span>
              <span>{run.instrument}</span><span>·</span>
              <span>{run.flowcell}</span>
            </div>

            {/* Stats */}
            <div className="stat-group">
              <div className="stat-item">
                <span className="stat-label">Libraries</span>
                <span className="stat-value">{activeLibs.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Samples</span>
                <span className="stat-value">{totalSamples}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Reads (GB)</span>
                <span className="stat-value">{totalReads.toFixed(1)}</span>
              </div>
            </div>

            {/* Meta details */}
            <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '0.5rem', marginBottom: '1.25rem', border: '1px solid var(--border-color)', fontSize: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 2fr', rowGap: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Seq Type</span>
              <span>{run.seq_type}</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Pattern</span>
              <span>{run.loading_pattern}</span>
            </div>

            {/* Expanded library table */}
            {isOpen && (
              <div className="table-container" style={{ maxHeight: 280, overflowY: 'auto', marginBottom: '1rem' }}>
                <table style={{ fontSize: '0.78rem' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.5rem 0.75rem' }}>S.No</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Library</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Samples</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Reads (GB)</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {run.libraries.map((lib, i) => (
                      <tr key={i} style={{ opacity: lib.samples === 0 ? 0.45 : 1 }}>
                        <td style={{ padding: '0.45rem 0.75rem', textAlign: 'center' }}>{lib.s_no}</td>
                        <td style={{ padding: '0.45rem 0.75rem' }}>{lib.name}</td>
                        <td style={{ padding: '0.45rem 0.75rem' }}>{lib.samples}</td>
                        <td style={{ padding: '0.45rem 0.75rem' }}>{lib.reads}</td>
                        <td style={{ padding: '0.45rem 0.75rem', color: 'var(--text-secondary)' }}>{lib.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button
              className="btn-primary"
              style={{ width: '100%', background: isOpen ? '#f1f5f9' : 'var(--accent-color)', color: isOpen ? 'var(--text-primary)' : 'white' }}
              onClick={() => setExpandedRun(isOpen ? null : run.run_id)}
            >
              {isOpen ? 'Collapse' : 'View Library Details'}
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default ViewSection
