/**
 * API Service Client for Rwenanura Parents Primary School
 */

export async function submitApplication(data) {
  try {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    return result;
  } catch (err) {
    console.error('API Error submitting application:', err);
    return { success: false, error: 'Network error submitting application. Please try again.' };
  }
}

export async function subscribeNewsletter(email) {
  try {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const result = await res.json();
    return result;
  } catch (err) {
    console.error('API Error subscribing newsletter:', err);
    return { success: false, error: 'Network error joining newsletter.' };
  }
}

export async function fetchNewsAndEvents() {
  try {
    const res = await fetch('/api/news');
    const result = await res.json();
    return result;
  } catch (err) {
    console.error('API Error fetching news:', err);
    return { success: false, newsAndEvents: [] };
  }
}
