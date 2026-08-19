const HIBP_URL = 'https://haveibeenpwned.com/api/v3/breachedaccount/';

export async function checkEmailWithHibp(email) {
  const apiKey = process.env.HIBP_API_KEY;
  if (!apiKey) {
    const error = new Error('HIBP_API_KEY is not configured. Add it to the server environment.');
    error.status = 503;
    throw error;
  }

  const url = `${HIBP_URL}${encodeURIComponent(email)}?truncateResponse=false`;
  const response = await fetch(url, {
    headers: {
      'hibp-api-key': apiKey,
      'user-agent': process.env.HIBP_USER_AGENT || 'BGJ-Cyber-Chaukidaar/0.1',
      'accept': 'application/json'
    }
  });

  if (response.status === 404) {
    return { found: false, breaches: [] };
  }
  if (response.status === 401) {
    const error = new Error('HIBP API authentication failed.');
    error.status = 502;
    throw error;
  }
  if (response.status === 429) {
    const error = new Error('Breach provider rate limit reached. Please try again later.');
    error.status = 429;
    throw error;
  }
  if (!response.ok) {
    const error = new Error(`Breach provider returned HTTP ${response.status}.`);
    error.status = 502;
    throw error;
  }

  const data = await response.json();
  return {
    found: Array.isArray(data) && data.length > 0,
    breaches: Array.isArray(data) ? data.map((item) => ({
      name: item.Name,
      title: item.Title,
      date: item.BreachDate,
      dataClasses: Array.isArray(item.DataClasses) ? item.DataClasses : []
    })) : []
  };
}
