export interface MediaItem {
  id: string;
  title: string;
  type: 'movie' | 'series';
  genre: string[];
  year: number;
  rating: string; // e.g., "TV-MA", "PG-13"
  duration: string; // e.g., "2h 15m" or "3 Seasons"
  description: string;
  thumbnail: string;
  backdrop: string;
  logo?: string;
  videoUrl?: string;
  trailerUrl?: string;
  match?: number; // 0-100
  isNew?: boolean;
  isTrending?: boolean;
  episodes?: Episode[];
  cast?: string[];
  director?: string;
}

export interface Episode {
  id: string;
  season: number;
  episode: number;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
}

export interface Category {
  id: string;
  name: string;
  items: MediaItem[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isKids: boolean;
  language: string;
  maturityRating: string;
}

export interface ContinueWatching {
  mediaId: string;
  profileId: string;
  progress: number; // 0-100
  currentEpisode?: Episode;
  timestamp: number;
}