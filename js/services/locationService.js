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
    // Use Maps JS SDK Geocoder (works with HTTP Referrer restricted keys)
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results.length > 0) {
          const loc = results[0].geometry.location;
          this.currentCoords = { lat: loc.lat(), lng: loc.lng() };
          resolve({ coords: this.currentCoords, formatted: results[0].formatted_address });
        } else {
          reject(new Error('GEOCODE_FAILED'));
        }
      });
    });
  },

  getCoords() {
    return this.currentCoords;
  }
};
