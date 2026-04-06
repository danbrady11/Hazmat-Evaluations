import React, { useState } from 'react';
import { TRAINING_TYPES, ROLES, QUESTIONS, SCALE_LABELS } from '../config';
import { submitEval } from '../sheets';
import './EvalForm.css';

const today = () => new Date().toISOString().split('T')[0];

const initialState = {
  date: today(),
  trainingType: '',
  instructor: '',
  role: '',
  q1: 0, q2: 0, q3: 0, q4: 0, q5: 0,
  overall: 0,
  comments: '',
};

export default function EvalForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const ratingComplete = QUESTIONS.every(q => form[q.id] > 0) && form.overall > 0;
  const canSubmit = form.trainingType && form.role && ratingComplete;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus('submitting');
    try {
      await submitEval(form);
      setStatus('success');
    } catch (e) {
      setErrorMsg(e.message);
      setStatus('error');
    }
  };

  if (status === 'success') return <SuccessScreen onAnother={() => { setForm(initialState); setStatus('idle'); }} />;

  return (
    <div className="ef-root">
      <header className="ef-header">
        <div className="ef-header-badge">HAZMAT</div>
        <div>
          <h1 className="ef-title">Training Evaluation</h1>
          <p className="ef-subtitle">Your feedback improves program reliability</p>
        </div>
      </header>

      <main className="ef-main">

        {/* Section 1 — Training info */}
        <section className="ef-section">
          <div className="ef-section-label">01 — Training info</div>

          <div className="ef-field">
            <label className="ef-label">Date</label>
            <input
              className="ef-input"
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
            />
          </div>

          <div className="ef-field">
            <label className="ef-label">Training type <span className="ef-req">*</span></label>
            <select className="ef-input" value={form.trainingType} onChange={e => set('trainingType', e.target.value)}>
              <option value="">Select…</option>
              {TRAINING_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="ef-field">
            <label className="ef-label">Instructor / lead (optional)</label>
            <input
              className="ef-input"
              type="text"
              placeholder="Name or leave blank"
              value={form.instructor}
              onChange={e => set('instructor', e.target.value)}
            />
          </div>

          <div className="ef-field">
            <label className="ef-label">Your role <span className="ef-req">*</span></label>
            <select className="ef-input" value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="">Select…</option>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </section>

        {/* Section 2 — Likert questions */}
        <section className="ef-section">
          <div className="ef-section-label">02 — Rate each statement</div>
          <div className="ef-scale-legend">
            <span>1 = Strongly disagree</span>
            <span>5 = Strongly agree</span>
          </div>

          {QUESTIONS.map((q, idx) => (
            <div key={q.id} className="ef-question">
              <div className="ef-q-text">
                <span className="ef-q-num">{String(idx + 1).padStart(2, '0')}</span>
                {q.label}
              </div>
              <div className="ef-scale">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    className={`ef-scale-btn ${form[q.id] === n ? 'ef-scale-btn--active' : ''}`}
                    onClick={() => set(q.id, n)}
                    title={SCALE_LABELS[n]}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Section 3 — Overall */}
        <section className="ef-section">
          <div className="ef-section-label">03 — Overall training rating</div>
          <div className="ef-overall">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                className={`ef-overall-btn ${form.overall === n ? 'ef-overall-btn--active' : ''}`}
                onClick={() => set('overall', n)}
              >
                <span className="ef-overall-num">{n}</span>
                <span className="ef-overall-star">{'★'.repeat(n)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Section 4 — Comments */}
        <section className="ef-section">
          <div className="ef-section-label">04 — Comments (optional)</div>
          <textarea
            className="ef-textarea"
            placeholder="What would make this training more effective? Any safety concerns, suggestions, or commendations?"
            value={form.comments}
            onChange={e => set('comments', e.target.value)}
            rows={4}
          />
        </section>

        {/* Submit */}
        {status === 'error' && (
          <div className="ef-error">Submission failed: {errorMsg}. Check your connection and try again.</div>
        )}

        <button
          className={`ef-submit ${!canSubmit ? 'ef-submit--disabled' : ''} ${status === 'submitting' ? 'ef-submit--loading' : ''}`}
          onClick={handleSubmit}
          disabled={!canSubmit || status === 'submitting'}
        >
          {status === 'submitting' ? 'Submitting…' : 'Submit evaluation'}
        </button>

        {!canSubmit && (
          <p className="ef-hint">Complete all required fields and ratings to submit.</p>
        )}
      </main>

      <footer className="ef-footer">
        Responses are anonymous · Used for program improvement only
      </footer>
    </div>
  );
}

function SuccessScreen({ onAnother }) {
  return (
    <div className="ef-root ef-success-root">
      <div className="ef-success">
        <div className="ef-success-icon">✓</div>
        <h2 className="ef-success-title">Evaluation submitted</h2>
        <p className="ef-success-body">
          Your feedback has been recorded. It goes directly toward documenting
          program reliability and improving future trainings.
        </p>
        <button className="ef-submit" onClick={onAnother}>Submit another</button>
      </div>
    </div>
  );
}
