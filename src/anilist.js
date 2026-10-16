import axios from 'axios';

const ANILIST_URL = 'https://graphql.anilist.co';

const SEARCH_QUERY = `
query ($search: String!, $page: Int!, $perPage: Int!) {
  Page(page: $page, perPage: $perPage) {
    media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
      id
      title { romaji english native }
      coverImage { large medium }
      description(asHtml: false)
      status
      episodes
      seasonYear
      format
      genres
    }
  }
}`;

export async function searchAnime(search, page = 1) {
  const response = await axios.post(
    ANILIST_URL,
    {
      query: SEARCH_QUERY,
      variables: { search, page: Number(page) || 1, perPage: 24 },
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 10000,
    }
  );

  if (response.data?.errors?.length) {
    throw new Error(response.data.errors[0].message || 'AniList search failed');
  }

  return (response.data?.data?.Page?.media || []).map((anime) => ({
    animeId: `anilist-${anime.id}`,
    animeTitle: anime.title?.english || anime.title?.romaji || anime.title?.native || 'Untitled',
    animeTitleRomaji: anime.title?.romaji || '',
    animeImg: anime.coverImage?.large || anime.coverImage?.medium || '',
    status: anime.status || '',
    releasedDate: anime.seasonYear ? String(anime.seasonYear) : '',
    episodes: anime.episodes ?? null,
    type: anime.format || 'TV',
    genres: anime.genres || [],
    synopsis: anime.description || '',
    source: 'AniList',
  }));
}
