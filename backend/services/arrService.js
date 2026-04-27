const axios = require('axios');

class ArrService {
  constructor(type, baseUrl, apiKey) {
    this.type = type;
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: `${baseUrl}/api/v3`,
      params: { apiKey: apiKey }
    });
  }

  async search(query) {
    try {
      const endpoint = this.type === 'radarr' ? '/movie/lookup' : '/series/lookup';
      const response = await this.client.get(endpoint, {
        params: { term: query }
      });
      return response.data;
    } catch (error) {
      console.error(`[${this.type}] Search error:`, error.message);
      return [];
    }
  }

  async request(item) {
    try {
      const endpoint = this.type === 'radarr' ? '/movie' : '/series';
      // Basic request body for Radarr/Sonarr
      const body = {
        ...item,
        monitored: true,
        addOptions: { searchForMovie: true, searchForMissingEpisodes: true },
        rootFolderPath: '/data/media/' + (this.type === 'radarr' ? 'movies' : 'tv'),
        qualityProfileId: 1
      };
      const response = await this.client.post(endpoint, body);
      return response.data;
    } catch (error) {
      console.error(`[${this.type}] Request error:`, error.message);
      throw error;
    }
  }

  async getQueue() {
    try {
      const response = await this.client.get('/queue');
      return response.data;
    } catch (error) {
      console.error(`[${this.type}] Queue error:`, error.message);
      return [];
    }
  }
}

module.exports = ArrService;
