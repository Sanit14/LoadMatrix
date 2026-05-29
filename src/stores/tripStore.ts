import { create } from 'zustand';
import type { TripChallan } from '../types';

interface TripState {
  tripData: TripChallan;
  setTripField: (field: keyof TripChallan, value: string) => void;
  resetTrip: () => void;
}

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const initialTripData: TripChallan = {
  challan_no: '',
  truck_no: '',
  driver_name: '',
  origin: '',
  destination: '',
  trip_date: getTodayDateString(),
};

export const useTripStore = create<TripState>((set) => ({
  tripData: initialTripData,
  setTripField: (field, value) =>
    set((state) => ({
      tripData: { ...state.tripData, [field]: value },
    })),
  resetTrip: () => set({ tripData: { ...initialTripData, trip_date: getTodayDateString() } }),
}));
