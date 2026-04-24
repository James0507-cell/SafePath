export async function fetchPlaces(
    query,
    page = 1,
    pageSize = 10,
    displayedPlaceIds = []
) {
    const offset = (page - 1) * pageSize;
    const fallbackToScrape = true;

    const params = new URLSearchParams({
        q: query,
        limit: String(pageSize),
        offset: String(offset),
        fallback_to_scrape: String(fallbackToScrape),
    });

    if (displayedPlaceIds.length > 0) {
        params.set('exclude_place_ids', displayedPlaceIds.join(','));
    }

    const url = `https://googlemapsscrapper-production-b1a1.up.railway.app/places/search?${params.toString()}`;

    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`Failed to fetch places: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
}

