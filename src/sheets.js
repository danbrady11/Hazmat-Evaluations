const SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL;

export async function submitEval(formData) {
  if (!SCRIPT_URL || SCRIPT_URL === 'your_apps_script_web_app_url_here') {
    // Dev mode — log to console instead
    console.log('[DEV] Eval submission:', formData);
    await new Promise(r => setTimeout(r, 800));
    return { success: true, dev: true };
  }

  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // avoids CORS preflight
    body: JSON.stringify(formData),
    redirect: 'follow',
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.result !== 'success') throw new Error(json.error || 'Unknown error');
  return { success: true };
}

export async function fetchResponses() {
  if (!SCRIPT_URL || SCRIPT_URL === 'your_apps_script_web_app_url_here') {
    // Return mock data for development
    return getMockData();
  }

  const res = await fetch(`${SCRIPT_URL}?action=get`, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

function getMockData() {
  const types = ['Level A Entry Drill', 'Hazmat CE Drill', 'Tabletop Exercise', 'Decon Operations Drill'];
  const instructors = ['D. Foreman', 'J. Martinez', 'K. Thompson'];
  const roles = ['Hazmat Technician', 'Company Officer', 'Fire Fighter / First Responder'];
  const data = [];
  const now = Date.now();

  for (let i = 0; i < 24; i++) {
    const d = new Date(now - i * 3 * 24 * 60 * 60 * 1000);
    data.push({
      Timestamp: d.toISOString(),
      Date: d.toISOString().split('T')[0],
      Training_Type: types[i % types.length],
      Instructor: instructors[i % instructors.length],
      Role: roles[i % roles.length],
      Q1_Objectives: Math.floor(Math.random() * 2) + 4,
      Q2_Relevance: Math.floor(Math.random() * 2) + 3,
      Q3_Instructor: Math.floor(Math.random() * 2) + 4,
      Q4_Prepared: Math.floor(Math.random() * 2) + 3,
      Q5_Recommend: Math.floor(Math.random() * 2) + 4,
      Overall: Math.floor(Math.random() * 2) + 4,
      Comments: i % 4 === 0 ? 'More hands-on time with Level A gear would be helpful.' : '',
    });
  }
  return data;
}
