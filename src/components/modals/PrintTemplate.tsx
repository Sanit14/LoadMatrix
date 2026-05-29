import { useTripStore } from '../../stores/tripStore';
import { useBiltiStore } from '../../stores/biltiStore';
import { formatWeight } from '../../utils/formatters';

export function PrintTemplate() {
  const { tripData } = useTripStore();
  const { biltiRows } = useBiltiStore();

  const totalItems = biltiRows.reduce((sum, b) => sum + (Number(b.items_count) || 0), 0);
  const totalWeight = biltiRows.reduce((sum, b) => sum + (Number(b.weight_numeric) || 0), 0);
  
  const now = new Date();
  const formattedTime = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const companyName = import.meta.env.VITE_APP_COMPANY_NAME || 'AI-Transit Logistics';

  return (
    <div id="print-manifest-template" className="print-only hidden font-mono text-black p-5 max-w-[800px] mx-auto border-2 border-black bg-white">
      {/* Manifest Header */}
      <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
        <h1 className="text-lg font-bold uppercase tracking-wider">{companyName}</h1>
        <h2 className="text-sm font-bold uppercase">Freight Trip Manifest</h2>
      </div>

      {/* Meta Specifications */}
      <table className="w-full mb-4 text-xs">
        <tbody>
          <tr>
            <td className="font-bold uppercase py-1 w-[15%]">Challan No:</td>
            <td className="font-bold py-1 w-[35%] text-sm">{tripData.challan_no || 'N/A'}</td>
            <td className="font-bold uppercase py-1 w-[15%]">Truck No:</td>
            <td className="font-bold py-1 w-[35%]">{tripData.truck_no || 'N/A'}</td>
          </tr>
          <tr>
            <td className="font-bold uppercase py-1">Driver Name:</td>
            <td className="py-1">{tripData.driver_name || 'N/A'}</td>
            <td className="font-bold uppercase py-1">Trip Date:</td>
            <td className="py-1">{tripData.trip_date || 'N/A'}</td>
          </tr>
          <tr>
            <td className="font-bold uppercase py-1">Origin:</td>
            <td className="py-1">{tripData.origin || 'N/A'}</td>
            <td className="font-bold uppercase py-1">Destination:</td>
            <td className="py-1">{tripData.destination || 'N/A'}</td>
          </tr>
        </tbody>
      </table>

      {/* Manifest Data Table */}
      <table className="w-full text-xs border-collapse mb-6">
        <thead>
          <tr className="border-t border-b border-black">
            <th className="py-2 text-center w-[5%] font-bold uppercase">#</th>
            <th className="py-2 text-left w-[15%] font-bold uppercase">Bilti No</th>
            <th className="py-2 text-left w-[25%] font-bold uppercase">Customer</th>
            <th className="py-2 text-left w-[25%] font-bold uppercase">Receiver</th>
            <th className="py-2 text-left w-[15%] font-bold uppercase">Goods</th>
            <th className="py-2 text-right w-[7%] font-bold uppercase">Items</th>
            <th className="py-2 text-right w-[13%] font-bold uppercase">Weight</th>
          </tr>
        </thead>
        <tbody>
          {biltiRows.map((b, idx) => (
            <tr key={idx} className="border-b border-dashed border-gray-300">
              <td className="py-2 text-center">{idx + 1}</td>
              <td className="py-2 font-bold">{b.bilti_no || '-'}</td>
              <td className="py-2">{b.customer_name || '-'}</td>
              <td className="py-2">{b.receiver_name || '-'}</td>
              <td className="py-2">{b.goods_type || '-'}</td>
              <td className="py-2 text-right">{b.items_count || 0}</td>
              <td className="py-2 text-right">{formatWeight(b.weight_numeric || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Summary */}
      <div className="border-t-2 border-b-2 border-black py-2.5 mb-8 flex justify-between font-bold text-sm">
        <span>TOTAL BILTIS: {biltiRows.length}</span>
        <span>TOTAL ITEMS: {totalItems}</span>
        <span>TOTAL WEIGHT: {formatWeight(totalWeight)}</span>
      </div>

      {/* Manifest Footer */}
      <div className="flex justify-between items-end text-[10px] mt-10">
        <div>
          Printed: {formattedTime} (ATME v1.0)
        </div>
        <div className="border-t border-black w-48 text-center pt-1 font-bold uppercase">
          Authorized Signature
        </div>
      </div>
    </div>
  );
}
