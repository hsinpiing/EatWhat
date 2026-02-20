const LocationService = {
  currentCoords: null,

  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('GEOLOCATION_NOT_SUPPORTED'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => {
          this.currentCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          resolve(this.currentCoords);
        },
        err => {
          if (err.code === 1) reject(new Error('PERMISSION_DENIED'));
          else reject(new Error('POSITION_UNAVAILABLE'));
        },
        { timeout: 10000, maximumAge: 60000 }
      );
    });
  },

  async geocodeAddress(address) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK' && data.results.length > 0) {
      const loc = data.results[0].geometry.location;
      this.currentCoords = { lat: loc.lat, lng: loc.lng };
      return { coords: this.currentCoords, formatted: data.results[0].formatted_address };
    }
    throw new Error('GEOCODE_FAILED');
  },

  getCoords() {
    return this.currentCoords;
  }
};
