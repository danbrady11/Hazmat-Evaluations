import React, { useState, useEffect, useMemo } from 'react';
import { QUESTIONS, ADMIN_PASSWORD, TRAINING_TYPES } from '../config';
import { fetchResponses } from '../sheets';
import './Admin.css';

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);

  const tryLogin = () => {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); }
    else { setPwError(true); setTimeout(() => setPwError(false), 1200); }
  };

  if (!authed) return (
    <div className="ad-login">
      <div className="ad-login-box">
        <div className="ad-header-badge">HAZMAT · ADMIN</div>
        <h1 className="ad-login-title">Training eval dashboard</h1>
        <input
          className={`ad-input ${pwError ? 'ad-input--error' : ''}`}
          type="password"
          placeholder="Password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && tryLogin()}
          autoFocus
        />
        <button className="ad-btn-primary" onClick={tryLogin}>Enter</button>
        {pwError && <p className="ad-error-msg">Incorrect password</p>}
      </div>
    </div>
  );

  return <Dashboard />;
}

function Dashboard() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [tab, setTab] = useState('overview'); // overview | responses

  useEffect(() => {
    fetchResponses()
      .then(data => { setResponses(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    if (filterType === 'All') return responses;
    return responses.filter(r => r['Training_Type'] === filterType || r['Training Type'] === filterType);
  }, [responses, filterType]);

  const avg = (key) => {
    const keyMap = { q1: 'Q1_Objectives', q2: 'Q2_Relevance', q3: 'Q3_Instructor', q4: 'Q4_Prepared', q5: 'Q5_Recommend' };
    const lookup = keyMap[key] || key;
    const vals = rows.map(r => parseFloat(getVal(r, key))).filter(v => !isNaN(v) && v > 0);
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const overallAvg = avg('Overall');
  const questionAvgs = QUESTIONS.map(q => ({
    ...q,
    avg: avg(q.id.toUpperCase() + '_' + q.short.replace(/ /g, '_')) || avg(q.id),
  }));

  const typeBreakdown = useMemo(() => {
    const map = {};
    responses.forEach(r => {
      const t = r['Training_Type'] || r['Training Type'] || 'Unknown';
      if (!map[t]) map[t] = { count: 0, total: 0 };
      map[t].count++;
      map[t].total += Number(r['Overall'] || 0);
    });
    return Object.entries(map).map(([type, d]) => ({
      type,
      count: d.count,
      avg: d.total ? (d.total / d.count).toFixed(1) : '—',
    })).sort((a, b) => b.count - a.count);
  }, [responses]);

  const comments = filtered.filter(r => r['Comments'] && r['Comments'].trim());

  if (loading) return <div className="ad-loading"><div className="ad-spinner" /><span>Loading from Google Sheets…</span></div>;
  if (error) return <div className="ad-error">Error: {error}</div>;

  return (
    <div className="ad-root">
      <header className="ad-header">
        <div>
          <div className="ad-header-badge">HAZMAT · ADMIN</div>
          <h1 className="ad-title">Training eval dashboard</h1>
          <p className="ad-subtitle">{responses.length} total responses · {filtered.length} shown</p>
        </div>
        <select className="ad-filter" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="All">All training types</option>
          {TRAINING_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </header>

      <div className="ad-tabs">
        {['overview', 'responses'].map(t => (
          <button key={t} className={`ad-tab ${tab === t ? 'ad-tab--active' : ''}`} onClick={() => setTab(t)}>
            {t === 'overview' ? 'Overview' : `Responses (${filtered.length})`}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {/* KPI strip */}
          <div className="ad-kpi-row">
            <KPI label="Overall avg" value={overallAvg ? `${overallAvg}/5` : '—'} highlight />
            <KPI label="Total responses" value={responses.length} />
            <KPI label="Training types" value={typeBreakdown.length} />
            <KPI label="With comments" value={comments.length} />
          </div>

          {/* Question breakdown */}
          <section className="ad-section">
            <div className="ad-section-label">Question averages</div>
            <div className="ad-q-list">
              {QUESTIONS.map((q, i) => {
                const a = avg(q.id) || 0;
                const pct = (a / 5) * 100;
                return (
                  <div key={q.id} className="ad-q-row">
                    <span className="ad-q-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="ad-q-label">{q.short}</span>
                    <div className="ad-bar-track">
                      <div className="ad-bar-fill" style={{ width: `${pct}%`, '--pct': pct }} />
                    </div>
                    <span className="ad-q-score">{a ? a.toFixed(1) : '—'}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* By training type */}
          <section className="ad-section">
            <div className="ad-section-label">By training type</div>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Training type</th>
                    <th>Responses</th>
                    <th>Overall avg</th>
                  </tr>
                </thead>
                <tbody>
                  {typeBreakdown.map(row => (
                    <tr key={row.type}>
                      <td>{row.type}</td>
                      <td>{row.count}</td>
                      <td>
                        <span className={`ad-score-badge ${Number(row.avg) >= 4 ? 'ad-score-badge--good' : Number(row.avg) >= 3 ? 'ad-score-badge--mid' : 'ad-score-badge--low'}`}>
                          {row.avg}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Comments */}
          {comments.length > 0 && (
            <section className="ad-section">
              <div className="ad-section-label">Written comments ({comments.length})</div>
              <div className="ad-comments">
                {comments.slice(0, 10).map((r, i) => (
                  <div key={i} className="ad-comment">
                    <div className="ad-comment-meta">
                      {r['Training_Type'] || r['Training Type']} · {r['Date'] || '—'} · {r['Role']}
                    </div>
                    <div className="ad-comment-text">"{r['Comments']}"</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {tab === 'responses' && (
        <section className="ad-section">
          <div className="ad-table-wrap">
            <table className="ad-table ad-table--responses">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Role</th>
                  <th>Overall</th>
                  {QUESTIONS.map((q, i) => <th key={q.id}>Q{i+1}</th>)}
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {[...filtered].reverse().map((r, i) => (
                  <tr key={i}>
                    <td className="ad-mono">{r['Date'] || '—'}</td>
                    <td>{r['Training_Type'] || r['Training Type'] || '—'}</td>
                    <td>{r['Role'] || '—'}</td>
                    <td>
                      <span className={`ad-score-badge ${Number(r['Overall']) >= 4 ? 'ad-score-badge--good' : Number(r['Overall']) >= 3 ? 'ad-score-badge--mid' : 'ad-score-badge--low'}`}>
                        {r['Overall'] || '—'}
                      </span>
                    </td>
                    {QUESTIONS.map(q => <td key={q.id} className="ad-mono">{r[{q1:'Q1_Objectives',q2:'Q2_Relevance',q3:'Q3_Instructor',q4:'Q4_Prepared',q5:'Q5_Recommend'}[q.id]] || '—'}</td>)}
                    <td className="ad-comment-cell">{r['Comments'] || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function KPI({ label, value, highlight }) {
  return (
    <div className={`ad-kpi ${highlight ? 'ad-kpi--highlight' : ''}`}>
      <div className="ad-kpi-value">{value}</div>
      <div className="ad-kpi-label">{label}</div>
    </div>
  );
}
