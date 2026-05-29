import { create } from 'zustand';
import { supabase, isMockSupabase } from '../services/supabase';

export interface GoodsWeightRule {
  id: string;
  keyword: string;
  weight_per_unit: number;
  unit_label: string;
  is_active: boolean;
  created_at?: string;
}

interface RulesState {
  rules: GoodsWeightRule[];
  fetchRules: () => Promise<void>;
  getWeightForGoods: (goodsType: string) => number | null;
}

export const useRulesStore = create<RulesState>((set, get) => ({
  rules: [],
  fetchRules: async () => {
    if (isMockSupabase) {
      const cachedRules = localStorage.getItem('atme_mock_rules');
      if (!cachedRules) {
        const defaultRules: GoodsWeightRule[] = [
          { id: '1', keyword: 'cement', weight_per_unit: 50, unit_label: 'bag', is_active: true },
          { id: '2', keyword: 'rice', weight_per_unit: 50, unit_label: 'sack', is_active: true },
          { id: '3', keyword: 'wheat', weight_per_unit: 50, unit_label: 'sack', is_active: true },
          { id: '4', keyword: 'sugar', weight_per_unit: 50, unit_label: 'bag', is_active: true },
          { id: '5', keyword: 'fertilizer', weight_per_unit: 45, unit_label: 'bag', is_active: true },
          { id: '6', keyword: 'cotton', weight_per_unit: 170, unit_label: 'bale', is_active: true },
        ];
        localStorage.setItem('atme_mock_rules', JSON.stringify(defaultRules));
        set({ rules: defaultRules });
      } else {
        set({ rules: JSON.parse(cachedRules) });
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('goods_weight_rules')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      set({ rules: data || [] });
    } catch (err) {
      console.error('Failed to fetch weight rules:', err);
    }
  },
  getWeightForGoods: (goodsType: string) => {
    const cleaned = goodsType.toLowerCase().trim();
    if (!cleaned) return null;
    const match = get().rules.find((r) => cleaned.includes(r.keyword.toLowerCase()));
    return match ? Number(match.weight_per_unit) : null;
  },
}));
