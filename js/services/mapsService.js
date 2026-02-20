const MapsService = {
  _map: null,
  _service: null,

  _getService() {
    if (!this._service) {
      if (!this._map) {
        const el = document.createElement('div');
        this._map = new google.maps.Map(el, { center: { lat: 0, lng: 0 }, zoom: 1 });
      }
      this._service = new google.maps.places.PlacesService(this._map);
    }
    return this._service;
  },

  searchNearby(lat, lng, params) {
    return new Promise((resolve, reject) => {
      const radius = params.distance || DISTANCE_RADIUS.default;

      let keyword = '';
      if (params.food && FOOD_KEYWORDS[params.food]) keyword += FOOD_KEYWORDS[params.food];
      if (params.occasion && OCCASION_KEYWORDS[params.occasion]) keyword += ' ' + OCCASION_KEYWORDS[params.occasion];
      if (params.dietary && params.dietary.length > 0) {
        params.dietary.forEach(d => { if (DIETARY_KEYWORDS[d]) keyword += ' ' + DIETARY_KEYWORDS[d]; });
      }
      if (!keyword) keyword = 'restaurant';

      const request = {
        location: new google.maps.LatLng(lat, lng),
        radius: radius,
        type: 'restaurant',
        openNow: true,
        keyword: keyword.trim(),
        language: getCurrentLang()
      };

      if (params.price && PRICE_MAP[params.price]) {
        request.minPriceLevel = PRICE_MAP[params.price].min;
        request.maxPriceLevel = PRICE_MAP[params.price].max;
      }

      this._getService().nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([]);
        } else if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
          reject(new Error('QUOTA_EXCEEDED'));
        } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
          reject(new Error('API_KEY_INVALID'));
        } else {
          reject(new Error('API_ERROR'));
        }
      });
    });
  },

  getPlaceDetails(placeId) {
    return new Promise((resolve, reject) => {
      const request = {
        placeId: placeId,
        fields: ['place_id', 'name', 'rating', 'user_ratings_total', 'price_level',
                 'formatted_address', 'geometry', 'photos', 'url', 'opening_hours', 'types']
      };
      this._getService().getDetails(request, (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          resolve(result);
        } else {
          reject(new Error('DETAILS_FAILED'));
        }
      });
    });
  },

  getPhotoUrl(photo, maxWidth = 400) {
    if (photo && typeof photo.getUrl === 'function') {
      return photo.getUrl({ maxWidth });
    }
    if (typeof photo === 'string') {
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photo}&key=${MAPS_API_KEY}`;
    }
    return null;
  },

  getDistanceText(place, userCoords) {
    if (!place.geometry || !userCoords) return '';
    const lat1 = userCoords.lat, lng1 = userCoords.lng;
    const loc = place.geometry.location;
    const lat2 = typeof loc.lat === 'function' ? loc.lat() : loc.lat;
    const lng2 = typeof loc.lng === 'function' ? loc.lng() : loc.lng;
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return dist < 1000 ? `${Math.round(dist)}m` : `${(dist/1000).toFixed(1)}km`;
  }
};
