
export interface Driver {
  id: string;
  rank: number;
  name: string;
  team: string;
  points: number;
  wins: number;
  podiums: number;
  image: string;
  country: string;
}

export interface Team {
  id: string;
  rank: number;
  name: string;
  points: number;
  logo: string;
}

export interface RaceEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  flag: string;
  circuitImage: string;
  laps: number;
  length: string;
  completed: boolean;
  winner?: string;
}

export interface RaceResult {
  round: string;
  raceName: string;
  date: string;
  grid: string;
  position: string;
  points: string;
  status: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  STANDINGS = 'STANDINGS',
  TRACKS = 'TRACKS',
  DRIVER_DETAILS = 'DRIVER_DETAILS',
  CIRCUITS = 'CIRCUITS'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isMapResult?: boolean;
  mapLinks?: Array<{ title: string; uri: string }>;
}