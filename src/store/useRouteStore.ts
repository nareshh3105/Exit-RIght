import { create } from 'zustand';
import type { Station, RouteRecommendation, TransportMode, CabProvider } from '@/types';

interface RouteState {
  // Selection
  fromStation:      Station | null;
  toDestination:    string;
  toAddress:        string;
  toLat:            number | null;
  toLng:            number | null;

  // Recommendation result
  recommendation:   RouteRecommendation | null;
  selectedMode:     TransportMode | null;
  cabProviders:     CabProvider[];
  isLoading:        boolean;
  error:            string | null;

  // Actions
  setFromStation:   (station: Station) => void;
  setDestination:   (name: string, address: string, lat?: number, lng?: number) => void;
  setRecommendation:(rec: RouteRecommendation) => void;
  setSelectedMode:  (mode: TransportMode) => void;
  setCabProviders:  (providers: CabProvider[]) => void;
  setLoading:       (loading: boolean) => void;
  setError:         (error: string | null) => void;
  reset:            () => void;
}

const initialState = {
  fromStation:    null,
  toDestination:  '',
  toAddress:      '',
  toLat:          null,
  toLng:          null,
  recommendation: null,
  selectedMode:   null,
  cabProviders:   [],
  isLoading:      false,
  error:          null,
};

export const useRouteStore = create<RouteState>()((set) => ({
  ...initialState,

  setFromStation:    (station) => set({ fromStation: station }),
  setDestination:    (name, address, lat, lng) =>
    set({ toDestination: name, toAddress: address, toLat: lat ?? null, toLng: lng ?? null }),
  setRecommendation: (rec)       => set({ recommendation: rec }),
  setSelectedMode:   (mode)      => set({ selectedMode: mode }),
  setCabProviders:   (providers) => set({ cabProviders: providers }),
  setLoading:        (loading)   => set({ isLoading: loading }),
  setError:          (error)     => set({ error }),
  reset:             ()          => set(initialState),
}));
