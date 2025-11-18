import { Driver, Team, RaceEvent, RaceResult } from '../types';

const BASE_URL = 'https://api.jolpi.ca/ergast/f1';

// Fallback images
const DEFAULT_DRIVER_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Silhouette_Anonyme.svg/500px-Silhouette_Anonyme.svg.png';
const DEFAULT_TRACK_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Hermanos_Rodriguez_2015.png/640px-Hermanos_Rodriguez_2015.png';

// Helper to fetch image from Wikipedia API using the title from the Ergast URL
const fetchWikiImage = async (url: string | undefined): Promise<string | null> => {
  if (!url) return null;
  try {
    // Ergast returns URLs like http://en.wikipedia.org/wiki/Max_Verstappen
    // We need to handle potential encoding and different structures
    const parts = url.split('/wiki/');
    if (parts.length < 2) return null;
    
    const rawSlug = parts[1];
    const slug = decodeURIComponent(rawSlug);
    
    if (!slug) return null;

    const wikiApiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(slug)}&prop=pageimages&format=json&pithumbsize=800&origin=*`;
    
    const res = await fetch(wikiApiUrl);
    const data = await res.json();
    
    if (!data.query || !data.query.pages) return null;

    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    if (pageId === '-1') return null;

    return pages[pageId]?.thumbnail?.source || null;
  } catch (e) {
    console.warn("Wiki image fetch failed", e);
    return null;
  }
};

const getCountryFlag = (country: string) => {
  const map: Record<string, string> = {
    'UK': '🇬🇧', 'Great Britain': '🇬🇧', 'Netherlands': '🇳🇱', 'Monaco': '🇲🇨', 
    'Australia': '🇦🇺', 'Spain': '🇪🇸', 'Mexico': '🇲🇽', 'Germany': '🇩🇪', 
    'Japan': '🇯🇵', 'Thailand': '🇹🇭', 'Denmark': '🇩🇰', 'Finland': '🇫🇮', 
    'China': '🇨🇳', 'France': '🇫🇷', 'USA': '🇺🇸', 'United States': '🇺🇸',
    'Argentina': '🇦🇷', 'Brazil': '🇧🇷', 'Italy': '🇮🇹', 'Canada': '🇨🇦',
    'Belgium': '🇧🇪', 'Austria': '🇦🇹', 'Hungary': '🇭🇺', 'Singapore': '🇸🇬',
    'Azerbaijan': '🇦🇿', 'Qatar': '🇶🇦', 'Saudi Arabia': '🇸🇦', 'UAE': '🇦🇪', 'Abu Dhabi': '🇦🇪',
    'Bahrain': '🇧🇭'
  };
  return map[country] || '🏁';
};

// --- API Fetchers ---

export const fetchNextRace = async (): Promise<RaceEvent | null> => {
  try {
    const res = await fetch(`${BASE_URL}/current/next.json`);
    if (!res.ok) return null;
    
    const data = await res.json();
    const raceData = data.MRData.RaceTable.Races[0];
    
    if (!raceData) return null;

    const wikiImage = await fetchWikiImage(raceData.Circuit.url);

    return {
      id: raceData.Circuit.circuitId,
      name: raceData.raceName,
      date: raceData.date,
      location: `${raceData.Circuit.Location.locality}, ${raceData.Circuit.Location.country}`,
      flag: getCountryFlag(raceData.Circuit.Location.country),
      circuitImage: wikiImage || DEFAULT_TRACK_IMAGE,
      laps: 0, 
      length: '',
      completed: false
    };
  } catch (e) {
    console.error("Failed to fetch next race", e);
    return null;
  }
};

export const fetchDriverStandings = async (): Promise<Driver[]> => {
  try {
    const res = await fetch(`${BASE_URL}/current/driverStandings.json`);
    if (!res.ok) return [];

    const data = await res.json();
    const standings = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];

    const driversWithImages = await Promise.all(standings.map(async (item: any) => {
      const wikiImage = await fetchWikiImage(item.Driver.url);
      
      return {
        id: item.Driver.driverId,
        rank: parseInt(item.position),
        name: `${item.Driver.givenName} ${item.Driver.familyName}`,
        team: item.Constructors[0]?.name || 'Unknown',
        points: parseFloat(item.points),
        wins: parseInt(item.wins),
        podiums: 0, // API doesn't always provide podiums directly in standings list
        image: wikiImage || DEFAULT_DRIVER_IMAGE,
        country: item.Driver.nationality === 'British' ? 'UK' : item.Driver.nationality === 'Dutch' ? 'NL' : item.Driver.nationality.substring(0, 3).toUpperCase()
      };
    }));

    return driversWithImages;
  } catch (e) {
    console.error("Failed to fetch driver standings", e);
    return [];
  }
};

export const fetchConstructorStandings = async (): Promise<Team[]> => {
  try {
    const res = await fetch(`${BASE_URL}/current/constructorStandings.json`);
    if (!res.ok) return [];

    const data = await res.json();
    const standings = data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];

    return standings.map((item: any) => ({
      id: item.Constructor.constructorId,
      rank: parseInt(item.position),
      name: item.Constructor.name,
      points: parseFloat(item.points),
      logo: '' 
    }));
  } catch (e) {
    console.error("Failed to fetch constructor standings", e);
    return [];
  }
};

export const fetchCircuitList = async (): Promise<any[]> => {
  try {
    const res = await fetch(`${BASE_URL}/current/circuits.json?limit=100`);
    if (!res.ok) return [];

    const data = await res.json();
    const circuits = data.MRData.CircuitTable.Circuits || [];

    return circuits.map((c: any) => ({
      id: c.circuitId,
      name: c.circuitName,
      location: `${c.Location.locality}, ${c.Location.country}`,
      url: c.url,
      lat: parseFloat(c.Location.lat),
      lng: parseFloat(c.Location.long)
    }));
  } catch (e) {
    console.error("Failed to fetch circuits", e);
    return [];
  }
};

export const fetchWikiImageForCircuit = async (url: string): Promise<string> => {
    const img = await fetchWikiImage(url);
    return img || DEFAULT_TRACK_IMAGE;
}

export const fetchDriverResults = async (driverId: string): Promise<RaceResult[]> => {
  try {
    const res = await fetch(`${BASE_URL}/current/drivers/${driverId}/results.json`);
    if (!res.ok) return [];

    const data = await res.json();
    const races = data.MRData.RaceTable.Races || [];

    return races.map((race: any) => ({
      round: race.round,
      raceName: race.raceName,
      date: race.date,
      grid: race.Results[0].grid,
      position: race.Results[0].positionText,
      points: race.Results[0].points,
      status: race.Results[0].status
    })).reverse(); // Most recent first
  } catch (e) {
    console.error(`Failed to fetch results for driver ${driverId}`, e);
    return [];
  }
};

export const fetchLastRaceResults = async (circuitId: string): Promise<any> => {
  try {
    // Strategy: Get all races for this circuit to find the latest one
    // Using a high limit to ensure we get the latest data
    // This is safer than using /last/ endpoints which are unstable on the mirror
    const racesRes = await fetch(`${BASE_URL}/circuits/${circuitId}/races.json?limit=500`);
    
    if (!racesRes.ok) return null;
    
    // Check for JSON content type to avoid parsing HTML error pages
    const racesType = racesRes.headers.get("content-type");
    if (!racesType || !racesType.includes("application/json")) {
      console.warn(`Non-JSON response for races list: ${circuitId}`);
      return null;
    }

    const racesData = await racesRes.json();
    const races = racesData.MRData?.RaceTable?.Races;

    if (!races || races.length === 0) return null;

    // Get the latest race info
    const lastRace = races[races.length - 1];
    const { season, round } = lastRace;

    // Fetch full results for that specific race
    const resultsRes = await fetch(`${BASE_URL}/${season}/${round}/results.json`);
    
    if (!resultsRes.ok) return null;
    
    const resultsType = resultsRes.headers.get("content-type");
    if (!resultsType || !resultsType.includes("application/json")) return null;

    const resultsData = await resultsRes.json();
    const raceWithResults = resultsData.MRData?.RaceTable?.Races?.[0];

    if (!raceWithResults) return null;

    return {
      raceName: raceWithResults.raceName,
      season: raceWithResults.season,
      date: raceWithResults.date,
      results: raceWithResults.Results.map((r: any) => ({
        position: r.position,
        driverName: `${r.Driver.givenName} ${r.Driver.familyName}`,
        driverCode: r.Driver.code,
        constructor: r.Constructor.name,
        time: r.Time?.time || r.status,
        points: r.points
      }))
    };
  } catch (e) {
    console.error(`Failed to fetch last race results for circuit ${circuitId}`, e);
    return null;
  }
};
