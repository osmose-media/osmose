const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function getClient() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const apiKeySetting = await prisma.setting.findUnique({ where: { key: 'tmdb_api_key' } });
  
  if (!apiKeySetting || !apiKeySetting.value) {
    throw new Error('CONFIG_MISSING: La clé API TMDB n\'est pas configurée.');
  }

  return axios.create({
    baseURL: TMDB_BASE_URL,
    params: {
      api_key: apiKeySetting.value,
      language: 'fr-FR'
    }
  });
}

async function searchTMDB(query, type = 'multi') {
  try {
    const client = await getClient();
    const response = await client.get(`/search/${type}`, { params: { query } });
    return response.data.results;
  } catch (error) { throw error; }
}

async function getTrending(type = 'movie', page = 1) {
  try {
    const client = await getClient();
    const response = await client.get(`/trending/${type}/week`, { params: { page } });
    return response.data; // Return full object for pagination info
  } catch (error) { throw error; }
}

async function getPopular(type = 'movie', page = 1) {
  try {
    const client = await getClient();
    const response = await client.get(`/${type}/popular`, { params: { page } });
    return response.data;
  } catch (error) { throw error; }
}

async function getDetails(tmdbId, type = 'movie') {
  try {
    const client = await getClient();
    const response = await client.get(`/${type}/${tmdbId}`, {
      params: { append_to_response: 'credits,videos,recommendations' }
    });
    const data = response.data;
    return {
      tmdbId: data.id,
      title: data.title || data.name,
      overview: data.overview,
      posterPath: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      backdropPath: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
      releaseDate: data.release_date || data.first_air_date,
      genres: data.genres?.map(g => g.name),
      rating: data.vote_average,
      seasons: data.seasons?.map(s => ({
        seasonNumber: s.season_number,
        name: s.name,
        episodeCount: s.episode_count,
        posterPath: s.poster_path ? `https://image.tmdb.org/t/p/w300${s.poster_path}` : null
      })),
      cast: data.credits?.cast?.slice(0, 12).map(c => ({ 
        name: c.name, 
        character: c.character, 
        profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null 
      }))
    };
  } catch (error) { throw error; }
}

async function getSeasonDetails(tmdbId, seasonNumber) {
  try {
    const client = await getClient();
    const response = await client.get(`/tv/${tmdbId}/season/${seasonNumber}`);
    return response.data.episodes.map(e => ({
      episodeNumber: e.episode_number,
      name: e.name,
      overview: e.overview,
      stillPath: e.still_path ? `https://image.tmdb.org/t/p/w300${e.still_path}` : null
    }));
  } catch (error) { throw error; }
}

module.exports = { searchTMDB, getTrending, getPopular, getDetails, getSeasonDetails };
