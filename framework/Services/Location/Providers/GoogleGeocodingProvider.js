/**
 * Google Geocoding Provider
 * 
 * Integrates with Google Maps Geocoding and Places APIs
 */

export default class GoogleGeocodingProvider {
  constructor(apiKey, config = {}) {
    this.apiKey = apiKey;
    this.config = {
      language: config.language || 'en',
      region: config.region || null,
      ...config,
    };
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  /**
   * Geocode address to coordinates
   * 
   * @param {string} address - Address to geocode
   * @returns {Promise<object>}
   */
  async geocode(address) {
    const params = new URLSearchParams({
      address,
      key: this.apiKey,
      language: this.config.language,
    });

    if (this.config.region) {
      params.append('region', this.config.region);
    }

    const response = await fetch(
      `${this.baseUrl}/geocode/json?${params.toString()}`
    );

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Geocoding failed: ${data.status}`);
    }

    const result = data.results[0];
    const location = result.geometry.location;

    return {
      latitude: location.lat,
      longitude: location.lng,
      formatted_address: result.formatted_address,
      place_id: result.place_id,
      types: result.types,
      address_components: result.address_components,
    };
  }

  /**
   * Reverse geocode coordinates to address
   * 
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<object>}
   */
  async reverseGeocode(lat, lon) {
    const params = new URLSearchParams({
      latlng: `${lat},${lon}`,
      key: this.apiKey,
      language: this.config.language,
    });

    const response = await fetch(
      `${this.baseUrl}/geocode/json?${params.toString()}`
    );

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Reverse geocoding failed: ${data.status}`);
    }

    const result = data.results[0];

    return {
      formatted_address: result.formatted_address,
      place_id: result.place_id,
      types: result.types,
      address_components: result.address_components,
      latitude: lat,
      longitude: lon,
    };
  }

  /**
   * Search nearby places
   * 
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} type - Place type (restaurant, hospital, etc.)
   * @param {number} radius - Search radius in meters
   * @param {object} options - Additional options
   * @returns {Promise<array>}
   */
  async nearbySearch(lat, lon, type, radius = 1000, options = {}) {
    const params = new URLSearchParams({
      location: `${lat},${lon}`,
      radius: radius.toString(),
      key: this.apiKey,
      language: this.config.language,
    });

    if (type) {
      params.append('type', type);
    }

    if (options.keyword) {
      params.append('keyword', options.keyword);
    }

    if (options.name) {
      params.append('name', options.name);
    }

    if (options.rankby) {
      params.append('rankby', options.rankby);
      params.delete('radius'); // radius not allowed with rankby
    }

    const response = await fetch(
      `${this.baseUrl}/place/nearbysearch/json?${params.toString()}`
    );

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Nearby search failed: ${data.status}`);
    }

    return data.results.map(place => ({
      place_id: place.place_id,
      name: place.name,
      vicinity: place.vicinity,
      types: place.types,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      open_now: place.opening_hours?.open_now,
      photos: place.photos?.map(p => ({
        reference: p.photo_reference,
        width: p.width,
        height: p.height,
      })),
    }));
  }

  /**
   * Get place details
   * 
   * @param {string} placeId - Google Place ID
   * @returns {Promise<object>}
   */
  async getPlaceDetails(placeId) {
    const params = new URLSearchParams({
      place_id: placeId,
      key: this.apiKey,
      language: this.config.language,
      fields: 'name,formatted_address,formatted_phone_number,opening_hours,rating,website,geometry',
    });

    const response = await fetch(
      `${this.baseUrl}/place/details/json?${params.toString()}`
    );

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Place details failed: ${data.status}`);
    }

    const result = data.result;

    return {
      place_id: placeId,
      name: result.name,
      formatted_address: result.formatted_address,
      phone: result.formatted_phone_number,
      website: result.website,
      rating: result.rating,
      opening_hours: result.opening_hours,
      latitude: result.geometry?.location.lat,
      longitude: result.geometry?.location.lng,
    };
  }

  /**
   * Text search for places
   * 
   * @param {string} query - Search query
   * @param {object} options - Location and radius
   * @returns {Promise<array>}
   */
  async textSearch(query, options = {}) {
    const params = new URLSearchParams({
      query,
      key: this.apiKey,
      language: this.config.language,
    });

    if (options.location) {
      params.append('location', options.location); // "lat,lng"
    }

    if (options.radius) {
      params.append('radius', options.radius.toString());
    }

    if (options.type) {
      params.append('type', options.type);
    }

    const response = await fetch(
      `${this.baseUrl}/place/textsearch/json?${params.toString()}`
    );

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Text search failed: ${data.status}`);
    }

    return data.results.map(place => ({
      place_id: place.place_id,
      name: place.name,
      formatted_address: place.formatted_address,
      types: place.types,
      rating: place.rating,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
    }));
  }

  /**
   * Autocomplete place search
   * 
   * @param {string} input - User input
   * @param {object} options - Location and radius for biasing
   * @returns {Promise<array>}
   */
  async autocomplete(input, options = {}) {
    const params = new URLSearchParams({
      input,
      key: this.apiKey,
      language: this.config.language,
    });

    if (options.location) {
      params.append('location', options.location);
    }

    if (options.radius) {
      params.append('radius', options.radius.toString());
    }

    if (options.types) {
      params.append('types', options.types);
    }

    const response = await fetch(
      `${this.baseUrl}/place/autocomplete/json?${params.toString()}`
    );

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Autocomplete failed: ${data.status}`);
    }

    return data.predictions.map(prediction => ({
      place_id: prediction.place_id,
      description: prediction.description,
      matched_substrings: prediction.matched_substrings,
      terms: prediction.terms,
      types: prediction.types,
    }));
  }
}
