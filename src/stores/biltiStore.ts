import { create } from 'zustand';
import type { BiltiEntry, MasterRecord } from '../types';

interface BiltiState {
  biltiRows: BiltiEntry[];
  customersMaster: string[];
  receiversMaster: MasterRecord[];
  
  // Grid actions
  setBiltiRows: (rows: BiltiEntry[]) => void;
  addRow: () => void;
  deleteRow: (index: number) => BiltiEntry;
  insertRowAt: (index: number, row: BiltiEntry) => void;
  updateCell: <K extends keyof BiltiEntry>(index: number, field: K, value: BiltiEntry[K]) => void;
  resetCanvas: () => void;
  
  // Master autocomplete data actions
  setCustomersMaster: (names: string[]) => void;
  setReceiversMaster: (records: MasterRecord[]) => void;
  addCustomerMaster: (name: string) => void;
  addReceiverMaster: (name: string, city?: string) => void;
}

export const createEmptyBiltiRow = (): BiltiEntry => ({
  bilti_no: '',
  customer_name: '',
  receiver_name: '',
  goods_type: '',
  items_count: 0,
  weight_numeric: 0,
  weight_auto_calculated: false,
});

export const useBiltiStore = create<BiltiState>((set, get) => ({
  biltiRows: [createEmptyBiltiRow()],
  customersMaster: [],
  receiversMaster: [],

  setBiltiRows: (rows) => set({ biltiRows: rows }),
  
  addRow: () => set((state) => ({
    biltiRows: [...state.biltiRows, createEmptyBiltiRow()],
  })),
  
  deleteRow: (index) => {
    const rows = [...get().biltiRows];
    const deleted = rows.splice(index, 1)[0];
    set({ biltiRows: rows.length > 0 ? rows : [createEmptyBiltiRow()] });
    return deleted;
  },

  insertRowAt: (index, row) => {
    const rows = [...get().biltiRows];
    rows.splice(index, 0, row);
    set({ biltiRows: rows });
  },
  
  updateCell: (index, field, value) => set((state) => {
    const rows = [...state.biltiRows];
    if (rows[index]) {
      rows[index] = { ...rows[index], [field]: value };
    }
    return { biltiRows: rows };
  }),
  
  resetCanvas: () => set({
    biltiRows: [createEmptyBiltiRow()],
  }),
  
  setCustomersMaster: (names) => set({ customersMaster: names }),
  
  setReceiversMaster: (records) => set({ receiversMaster: records }),
  
  addCustomerMaster: (name) => set((state) => {
    if (state.customersMaster.includes(name)) return {};
    return { customersMaster: [...state.customersMaster, name] };
  }),
  
  addReceiverMaster: (name, city) => set((state) => {
    if (state.receiversMaster.some(r => r.name === name)) return {};
    return {
      receiversMaster: [...state.receiversMaster, { id: crypto.randomUUID(), name, city }],
    };
  }),
}));
