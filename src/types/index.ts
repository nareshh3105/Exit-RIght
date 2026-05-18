// ─── Exit Right — Shared TypeScript types ───────────────────

export type TransportMode = 'cab' | 'auto' | 'bus' | 'walk';
export type CrowdLevel = 0 | 1 | 2 | 3;
export type SafetyTone = 'good' | 'ok' | 'bad';
export type MetroLine = 'Blue' | 'Green' | 'Blue/Green';

// ── Auth ──────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

// ── Profile ───────────────────────────────────────────────────
export interface Profile {
  id: string;
  email: string;
  fullName: string;
  homeStation: string;
  avatarInitials: string;
  preferredMode: TransportMode;
  budgetCap: number;
  theme: 'auto' | 'light' | 'dark';
  createdAt: string;
}

// ── Station ───────────────────────────────────────────────────
export interface Station {
  id: string;
  name: string;
  line: MetroLine;
  distanceKm?: number;
  isNearest?: boolean;
  lat?: number;
  lng?: number;
}

// ── Saved route ───────────────────────────────────────────────
export interface SavedRoute {
  id: string;
  userId: string;
  name: string;
  address: string;
  icon: string;
  color: string;
  destinationLat?: number;
  destinationLng?: number;
  preferredGate: number;
  preferredMode: TransportMode;
  estimatedEta: string;
  estimatedCost: string;
  createdAt: string;
}

// ── Trip history ──────────────────────────────────────────────
export interface TripHistory {
  id: string;
  userId: string;
  fromStation: string;
  toDestination: string;
  toAddress: string;
  departedAt: string;
  arrivedAt?: string;
  gateUsed: number;
  modeUsed: TransportMode;
  actualCost: number;
  safetyModeActive: boolean;
  tag?: string;
  tagTone?: 'good' | 'safety';
}

// ── Safety contact ────────────────────────────────────────────
export interface SafetyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
}

// ── Transport recommendation ──────────────────────────────────
export interface TransportOption {
  mode: TransportMode;
  name: string;
  eta: string;
  cost: string;
  crowdLevel: CrowdLevel;
  safetyScore: number;
  confidencePercent: number;
  distanceKm: number;
  isRecommended?: boolean;
  isCheapest?: boolean;
  shouldAvoid?: boolean;
  providerRoute?: string; // e.g. '/cabs'
}

export interface GateOption {
  gate: number;
  isRecommended: boolean;
  extraTime?: string;
  status: 'good' | 'ok' | 'bad';
  reason?: string;
}

export interface GateRecommendation {
  recommendedGate: number;
  reasons: string[];
  alternateGates: Array<{
    gate: number;
    extraTime: string;
    status: 'ok' | 'bad';
  }>;
}

export interface WeatherAlert {
  type: 'rain' | 'storm' | 'heat';
  message: string;
  minutesAway?: number;
}

export interface RouteRecommendation {
  id?: string;
  fromStation: Station;
  toDestination: string;
  toAddress: string;
  distanceKm: number;
  gateRecommendation: GateRecommendation;
  transportOptions: TransportOption[];
  weatherAlert?: WeatherAlert;
  aiTake?: string;
}

// ── Cab provider ──────────────────────────────────────────────
export interface CabProvider {
  id: string;
  brand: string;
  type: string;
  monogram: string;
  brandColor: string;
  price: number;
  etaMinutes: number;
  rating: number;
  surgeMultiplier?: number;
  isRecommended?: boolean;
  isCheapest?: boolean;
  note?: string;
  badge?: string;
  deepLinkUrl: string;
}

// ── Settings ──────────────────────────────────────────────────
export interface UserSettings {
  preferredTransport: TransportMode;
  budgetCap: number;
  theme: 'auto' | 'light' | 'dark';
  safetyModeAtNight: boolean;
  nightModeThreshold: string; // e.g. "21:00"
  notifications: {
    exitReminders: boolean;
    weatherAlerts: boolean;
    crowdWarnings: boolean;
  };
}

// ── Exit gate ─────────────────────────────────────────────────
export interface ExitGate {
  id: string;
  stationId: string;
  gateNumber: number;
  label: string;
  lat: number;
  lng: number;
  hasCover: boolean;
  hasCctv: boolean;
  lightingScore: number;
  accessibility: 'stairs' | 'escalator' | 'lift';
}

// ── Crowd data ────────────────────────────────────────────────
export interface GateCrowd {
  gate: number;
  level: CrowdLevel;
}

export interface CrowdData {
  stationId: string;
  gates: GateCrowd[];
  fetchedAt: string;
}

// ── Weather data ──────────────────────────────────────────────
export interface WeatherData {
  condition: string;
  tempCelsius: number;
  humidity: number;
  windKph: number;
  rainProbability: number;
  rainMmNextHour: number;
  fetchedAt: string;
}

// ── Safety data ───────────────────────────────────────────────
export interface SafetyFactor {
  label: string;
  score: number;
  tone: SafetyTone;
  icon: string;
}

export interface SafetyData {
  overallScore: number;
  tone: SafetyTone;
  factors: SafetyFactor[];
}

// ── Feedback ──────────────────────────────────────────────────
export type FeedbackType = 'helpful' | 'wrong_gate' | 'wrong_mode' | 'too_expensive' | 'unsafe' | 'other';

export interface RecommendationFeedback {
  recommendationId: string;
  rating: number;
  feedbackType: FeedbackType;
  comment?: string;
}

// ── User preferences (learned) ────────────────────────────────
export interface UserPreferencesData {
  timeSensitivity: number;
  costSensitivity: number;
  safetySensitivity: number;
  comfortSensitivity: number;
  avoidedModes: TransportMode[];
  preferredGates: Record<string, number>;
}

// ── API responses ─────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
