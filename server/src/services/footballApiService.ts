import axios, { AxiosInstance } from 'axios';
import { config } from '../config/environment';

/**
 * API-Football Integration Service
 * Free Tier: 100 requests/day
 * Documentation: https://www.api-football.com/documentation-v3
 * 
 * To get a FREE API key:
 * 1. Go to https://www.api-football.com/
 * 2. Click "Get Your Free API Key"
 * 3. Sign up with email (no credit card required)
 * 4. Copy your API key
 * 5. Add to .env: FOOTBALL_API_KEY=your-key-here
 */

interface ApiFootballTeam {
  id: number;
  name: string;
  code: string;
  country: string;
  logo: string;
}

interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    venue: {
      name: string;
      city: string;
    };
    status: {
      short: string; // NS, 1H, HT, 2H, FT, etc.
    };
  };
  league: {
    id: number;
    name: string;
    round: string;
  };
  teams: {
    home: ApiFootballTeam;
    away: ApiFootballTeam;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
  };
}

interface ApiFootballStanding {
  rank: number;
  team: ApiFootballTeam;
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
}

class FootballApiService {
  private client: AxiosInstance;
  private requestCount: number = 0;
  private dailyLimit: number = 100;

  constructor() {
    this.client = axios.create({
      baseURL: config.footballApi.baseUrl,
      headers: {
        'x-apisports-key': config.footballApi.key,
      },
      timeout: 10000,
    });

    // Log requests for monitoring
    this.client.interceptors.request.use((config) => {
      this.requestCount++;
      console.log(`[API-Football] Request #${this.requestCount} - ${config.method?.toUpperCase()} ${config.url}`);
      
      if (this.requestCount >= this.dailyLimit) {
        console.warn(`⚠️  [API-Football] Approaching daily limit (${this.dailyLimit} requests)`);
      }
      
      return config;
    });

    // Log responses and handle errors
    this.client.interceptors.response.use(
      (response) => {
        const remaining = response.headers['x-ratelimit-requests-remaining'];
        console.log(`[API-Football] ✅ Success - ${remaining} requests remaining today`);
        return response;
      },
      (error) => {
        if (error.response) {
          console.error(`[API-Football] ❌ Error ${error.response.status}:`, error.response.data);
        } else {
          console.error(`[API-Football] ❌ Network Error:`, error.message);
        }
        throw error;
      }
    );
  }

  /**
   * Get World Cup fixtures
   * Endpoint: GET /fixtures
   * Docs: https://www.api-football.com/documentation-v3#tag/Fixtures/operation/get-fixtures
   */
  async getFixtures(season: string = config.footballApi.season): Promise<ApiFootballFixture[]> {
    try {
      const response = await this.client.get('/fixtures', {
        params: {
          league: config.footballApi.leagueId, // World Cup = 1
          season: season,
        },
      });

      return response.data.response || [];
    } catch (error) {
      console.error('[API-Football] Error fetching fixtures:', error);
      return [];
    }
  }

  /**
   * Get live fixtures
   * Endpoint: GET /fixtures?live=all
   */
  async getLiveFixtures(): Promise<ApiFootballFixture[]> {
    try {
      const response = await this.client.get('/fixtures', {
        params: {
          league: config.footballApi.leagueId,
          season: config.footballApi.season,
          live: 'all',
        },
      });

      return response.data.response || [];
    } catch (error) {
      console.error('[API-Football] Error fetching live fixtures:', error);
      return [];
    }
  }

  /**
   * Get fixtures by date
   * Endpoint: GET /fixtures?date=YYYY-MM-DD
   */
  async getFixturesByDate(date: string): Promise<ApiFootballFixture[]> {
    try {
      const response = await this.client.get('/fixtures', {
        params: {
          league: config.footballApi.leagueId,
          season: config.footballApi.season,
          date: date, // Format: YYYY-MM-DD
        },
      });

      return response.data.response || [];
    } catch (error) {
      console.error('[API-Football] Error fetching fixtures by date:', error);
      return [];
    }
  }

  /**
   * Get specific fixture by ID
   * Endpoint: GET /fixtures?id={fixtureId}
   */
  async getFixtureById(fixtureId: number): Promise<ApiFootballFixture | null> {
    try {
      const response = await this.client.get('/fixtures', {
        params: {
          id: fixtureId,
        },
      });

      return response.data.response[0] || null;
    } catch (error) {
      console.error('[API-Football] Error fetching fixture by ID:', error);
      return null;
    }
  }

  /**
   * Get league standings (group tables)
   * Endpoint: GET /standings
   * Docs: https://www.api-football.com/documentation-v3#tag/Standings
   */
  async getStandings(season: string = config.footballApi.season): Promise<ApiFootballStanding[]> {
    try {
      const response = await this.client.get('/standings', {
        params: {
          league: config.footballApi.leagueId,
          season: season,
        },
      });

      // API returns nested structure: response[0].league.standings[groupIndex][teamIndex]
      const standings = response.data.response[0]?.league?.standings || [];
      
      // Flatten all groups into single array
      return standings.flat();
    } catch (error) {
      console.error('[API-Football] Error fetching standings:', error);
      return [];
    }
  }

  /**
   * Get teams participating in World Cup
   * Endpoint: GET /teams
   */
  async getTeams(season: string = config.footballApi.season): Promise<ApiFootballTeam[]> {
    try {
      const response = await this.client.get('/teams', {
        params: {
          league: config.footballApi.leagueId,
          season: season,
        },
      });

      return response.data.response.map((item: any) => item.team) || [];
    } catch (error) {
      console.error('[API-Football] Error fetching teams:', error);
      return [];
    }
  }

  /**
   * Get top scorers
   * Endpoint: GET /players/topscorers
   */
  async getTopScorers(season: string = config.footballApi.season): Promise<any[]> {
    try {
      const response = await this.client.get('/players/topscorers', {
        params: {
          league: config.footballApi.leagueId,
          season: season,
        },
      });

      return response.data.response || [];
    } catch (error) {
      console.error('[API-Football] Error fetching top scorers:', error);
      return [];
    }
  }

  /**
   * Get request count for monitoring
   */
  getRequestCount(): number {
    return this.requestCount;
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!config.footballApi.key && config.footballApi.key.length > 0;
  }
}

// Export singleton instance
export const footballApiService = new FootballApiService();

export default footballApiService;
