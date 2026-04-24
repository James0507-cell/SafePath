export async function fetchPlaces(query, limit = 100) {
  const response = await fetch(`https://googlemapsscrapper-production-b1a1.up.railway.app/scrape?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch places');
  }
  const data = await response.json();
  return data.results || [];
}
