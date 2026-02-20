const MapsService = {
  async searchNearby(lat, lng, params) {
    const radius = params.distance || DISTANCE_RADIUS.default;
    let keyword = '';
    if (params.food && FOOD_KEYWORDS[params.food]) keyword += FOOD_KEYWORDS[params.food];
    if (params.occasion && OCCASION_KEYWORDS[params.occasion]) keyword += ' ' + OCCASION_KEYWORDS[params.occasion];
    if (params.dietary && params.dietary.length > 0) {
      params.dietary.forEach(d => { if (DIETARY_KEYWORDS[d]) keyword += ' ' + DIETARY_KEYWORDS[d]; });
    }
    if (!keyword) keyword = 'restaurant food';

    let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=restaurant&opennow=true&keyword=${encodeURIComponent(keyword)}&key=${MAPS_API_KEY}`;
    if (params.price) {
      const p = PRICE_MAP[params.price];
      if (p) url += `&minprice=${p.min}&maxprice=${p.max}`;
    }
    url += `&language=${getCurrentLang()}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('API_ERROR');
    const data = await res.json();
    if (data.status === 'REQUEST_DENIED') throw new Error('API_KEY_INVALID');
    if (data.status === 'OVER_QUERY_LIMIT') throw new Error('QUOTA_EXCEEDED');
    return data.results || [];
  },

  async getPlaceDetails(placeId) {
    const fields = 'place_id,name,rating,user_ratings_total,price_level,formatted_address,geometry,photos,url,opening_hours,types';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${MAPS_API_KEY}&language=${getCurrentLang()}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK') return data.result;
    throw new Error('DETAILS_FAILED');
  },

  getPhotoUrl(photoReference, maxWidth = 400) {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${MAPS_API_KEY}`;
  },

  getDistanceText(place, userCoords) {
    if (!place.geometry || !userCoords) return '';
    const lat1 = userCoords.lat, lng1 = userCoords.lng;
    const lat2 = place.geometry.location.lat, lng2 = place.geometry.location.lng;
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return dist < 1000 ? `${Math.round(dist)}m` : `${(dist/1000).toFixed(1)}km`;
  }
};
