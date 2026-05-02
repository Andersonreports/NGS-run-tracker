import React, { useState } from 'react'
import * as XLSX from 'xlsx'

const FIXED_LIBRARIES = [
  { s_no: 1,  name: 'Exome_AND-TP-511,514,515,516,517', samples: 0, reads: 0, remarks: '' },
  { s_no: 2,  name: 'Embryosure',                        samples: 0, reads: 0, remarks: '' },
  { s_no: 3,  name: 'Sophia Exome-Adyar',                samples: 0, reads: 0, remarks: '' },
  { s_no: 4,  name: 'Myeloid-Variantplex_CMC samples',   samples: 0, reads: 0, remarks: '' },
  { s_no: 5,  name: 'CMC_Classic panel samples',         samples: 0, reads: 0, remarks: '' },
  { s_no: 6,  name: 'CMC Sample-RTR19',                  samples: 0, reads: 0, remarks: '' },
  { s_no: 7,  name: 'Oncopro',                           samples: 0, reads: 0, remarks: '' },
  { s_no: 8,  name: 'HLA',                               samples: 0, reads: 0, remarks: '' },
  { s_no: 9,  name: 'HBB',                               samples: 0, reads: 0, remarks: '' },
  { s_no: 10, name: 'Sophia Exome-AND',                  samples: 0, reads: 0, remarks: 'Validation' },
  { s_no: 11, name: 'Sophia_AND_cfDNA',                  samples: 0, reads: 0, remarks: 'Validation' },
  { s_no: 12, name: 'Myeloid-Variantplex_AND',           samples: 0, reads: 0, remarks: 'Validation' },
]

const InputSection = ({ onSave }) => {
  const [runDetails, setRunDetails] = useState({
    date: new Date().toISOString().split('T')[0],
    run_id: '',
    instrument: 'Surfseq5000',
    flowcell: '',
    seq_type: 'PE 150',
    loading_pattern: 'Standard-Automatic',
  })
  const [libraries, setLibraries] = useState(
    FIXED_LIBRARIES.map(l => ({ ...l }))
  )
  const [saved, setSaved] = useState(false)

  const handleRunChange = e =>
    setRunDetails(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleLibChange = (i, field, val) => {
    setLibraries(prev => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: field === 'samples' || field === 'reads' ? Number(val) : val }
      return next
    })
  }

  const totalSamples = libraries.reduce((s, l) => s + l.samples, 0)
  const totalReads   = libraries.reduce((s, l) => s + l.reads,   0)

  const handleSave = () => {
    if (!runDetails.run_id) { alert('Please enter a Run ID'); return }
    const run = { ...runDetails, libraries }
    onSave(run)           // saves to localStorage in App
    exportExcel(run)      // also downloads Excel
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const exportExcel = (run) => {
    const wb = XLSX.utils.book_new()

    // Sheet 1 – Run metadata
    const meta = [[
      'Date', 'Run ID', 'Instrument', 'Flowcell', 'Seq. Type', 'Loading Pattern'
    ], [
      run.date, run.run_id, run.instrument, run.flowcell, run.seq_type, run.loading_pattern
    ]]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(meta), 'Run Details')

    // Sheet 2 – Libraries
    const libRows = [
      ['S. No.', 'Name of Library', 'No. of Samples', 'Required Reads (GB)', 'Remarks'],
      ...run.libraries.map(l => [l.s_no, l.name, l.samples, l.reads, l.remarks]),
      ['', 'Total', totalSamples, totalReads.toFixed(1), ''],
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(libRows), 'Libraries')

    XLSX.writeFile(wb, `${run.run_id}_${run.date}.xlsx`)
  }

  return (
    <div className="card fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>New Sequence Run</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Fill in run metadata — library names are pre-fixed. Enter samples &amp; reads, then save.
        </p>
      </div>

      {/* ── Run metadata ── */}
      <div className="form-grid">
        {[
          { label: 'Date',            name: 'date',            type: 'date'   },
          { label: 'Run Details',     name: 'run_id',          type: 'text', placeholder: 'e.g. Run-79B' },
          { label: 'Instrument',      name: 'instrument',      type: 'text'   },
          { label: 'Flowcell',        name: 'flowcell',        type: 'text', placeholder: 'e.g. FCP(1.1TB)' },
          { label: 'Seq. Type',       name: 'seq_type',        type: 'text'   },
          { label: 'Loading Pattern', name: 'loading_pattern', type: 'text'   },
        ].map(f => (
          <div className="input-group" key={f.name}>
            <label>{f.label}</label>
            <input
              type={f.type}
              name={f.name}
              value={runDetails[f.name]}
              placeholder={f.placeholder || ''}
              onChange={handleRunChange}
            />
          </div>
        ))}
      </div>

      {/* ── Library table ── */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: 60 }}>S. No.</th>
              <th>Name of Library</th>
              <th style={{ width: 140 }}>No. of Samples</th>
              <th style={{ width: 160 }}>Required Reads (GB)</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {libraries.map((lib, i) => (
              <tr key={i}>
                <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>{lib.s_no}</td>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500, paddingLeft: '1rem' }}>{lib.name}</td>
                <td>
                  <input
                    type="number" min="0"
                    style={{ width: '100%' }}
                    value={lib.samples || ''}
                    placeholder="0"
                    onChange={e => handleLibChange(i, 'samples', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number" min="0" step="0.1"
                    style={{ width: '100%' }}
                    value={lib.reads || ''}
                    placeholder="0.0"
                    onChange={e => handleLibChange(i, 'reads', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    style={{ width: '100%' }}
                    value={lib.remarks}
                    onChange={e => handleLibChange(i, 'remarks', e.target.value)}
                  />
                </td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan={2} style={{ textAlign: 'right', paddingRight: '1.5rem', fontWeight: 700 }}>Total</td>
              <td style={{ fontWeight: 700 }}>{totalSamples}</td>
              <td style={{ fontWeight: 700 }}>{totalReads.toFixed(1)}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
        {saved && <span style={{ color: 'var(--success-color)', fontWeight: 600, fontSize: '0.875rem' }}>✓ Saved &amp; Excel downloaded</span>}
        <button className="btn-primary" onClick={handleSave}>
          Save &amp; Export Excel ↓
        </button>
      </div>
    </div>
  )
}

export default InputSection
