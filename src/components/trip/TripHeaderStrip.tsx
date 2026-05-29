import { useRef, useEffect } from 'react';
import { useTripStore } from '../../stores/tripStore';

export function TripHeaderStrip() {
  const { tripData, setTripField } = useTripStore();
  const challanInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus Challan No on initial load
  useEffect(() => {
    if (challanInputRef.current) {
      challanInputRef.current.focus();
    }
  }, []);

  return (
    <div className="bg-terminal-panel border-b border-terminal-default p-4 select-none">
      <div className="text-[11px] font-mono uppercase tracking-widest text-data-blue mb-3 font-semibold">
        Trip Logistics Manifest Header
      </div>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Challan No */}
        <div>
          <label className="block text-[11px] font-sans font-medium text-silver-dust mb-1.5">
            Challan No
          </label>
          <input
            ref={challanInputRef}
            type="text"
            placeholder="e.g. TRP-0041"
            value={tripData.challan_no}
            onChange={(e) => setTripField('challan_no', e.target.value)}
            className="w-full bg-terminal-base border border-terminal-default rounded px-3 py-1.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-data-blue focus:ring-1 focus:ring-data-blue/40 uppercase transition"
          />
        </div>

        {/* Truck No */}
        <div>
          <label className="block text-[11px] font-sans font-medium text-silver-dust mb-1.5">
            Truck No
          </label>
          <input
            type="text"
            placeholder="e.g. MH31-AB-1234"
            value={tripData.truck_no}
            onChange={(e) => setTripField('truck_no', e.target.value)}
            className="w-full bg-terminal-base border border-terminal-default rounded px-3 py-1.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-data-blue focus:ring-1 focus:ring-data-blue/40 uppercase transition"
          />
        </div>

        {/* Driver Name */}
        <div>
          <label className="block text-[11px] font-sans font-medium text-silver-dust mb-1.5">
            Driver Name
          </label>
          <input
            type="text"
            placeholder="e.g. Ramesh Kumar"
            value={tripData.driver_name}
            onChange={(e) => setTripField('driver_name', e.target.value)}
            className="w-full bg-terminal-base border border-terminal-default rounded px-3 py-1.5 text-xs text-white font-sans placeholder-gray-600 focus:outline-none focus:border-data-blue focus:ring-1 focus:ring-data-blue/40 transition"
          />
        </div>

        {/* Origin */}
        <div>
          <label className="block text-[11px] font-sans font-medium text-silver-dust mb-1.5">
            Origin
          </label>
          <input
            type="text"
            placeholder="e.g. Nagpur"
            value={tripData.origin}
            onChange={(e) => setTripField('origin', e.target.value)}
            className="w-full bg-terminal-base border border-terminal-default rounded px-3 py-1.5 text-xs text-white font-sans placeholder-gray-600 focus:outline-none focus:border-data-blue focus:ring-1 focus:ring-data-blue/40 transition"
          />
        </div>

        {/* Destination */}
        <div>
          <label className="block text-[11px] font-sans font-medium text-silver-dust mb-1.5">
            Destination
          </label>
          <input
            type="text"
            placeholder="e.g. Delhi"
            value={tripData.destination}
            onChange={(e) => setTripField('destination', e.target.value)}
            className="w-full bg-terminal-base border border-terminal-default rounded px-3 py-1.5 text-xs text-white font-sans placeholder-gray-600 focus:outline-none focus:border-data-blue focus:ring-1 focus:ring-data-blue/40 transition"
          />
        </div>

        {/* Trip Date */}
        <div>
          <label className="block text-[11px] font-sans font-medium text-silver-dust mb-1.5">
            Trip Date
          </label>
          <input
            type="date"
            value={tripData.trip_date}
            onChange={(e) => setTripField('trip_date', e.target.value)}
            className="w-full bg-terminal-base border border-terminal-default rounded px-3 py-1 text-xs text-white font-mono focus:outline-none focus:border-data-blue focus:ring-1 focus:ring-data-blue/40 transition"
          />
        </div>
      </div>
    </div>
  );
}
