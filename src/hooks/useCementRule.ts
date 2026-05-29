import { useEffect, useRef } from 'react';
import { useWatch } from 'react-hook-form';
import type { UseFormSetValue, Control } from 'react-hook-form';
import { useRulesStore } from '../stores/rulesStore';

interface UseCementRuleProps {
  control: Control<any>;
  index: number;
  setValue: UseFormSetValue<any>;
}

export function useCementRule({ control, index, setValue }: UseCementRuleProps) {
  const getWeightForGoods = useRulesStore((state) => state.getWeightForGoods);

  // Watch the specific row's fields
  const goodsType = useWatch({
    control,
    name: `biltis.${index}.goods_type` as const,
  });

  const itemsCount = useWatch({
    control,
    name: `biltis.${index}.items_count` as const,
  });

  const weightAutoCalculated = useWatch({
    control,
    name: `biltis.${index}.weight_auto_calculated` as const,
  });

  const weightNumeric = useWatch({
    control,
    name: `biltis.${index}.weight_numeric` as const,
  });

  // Track the previous values to detect changes
  const prevGoodsTypeRef = useRef<string>('');
  const prevItemsCountRef = useRef<number>(0);

  useEffect(() => {
    const currentGoods = (goodsType || '').toString().toLowerCase().trim();
    const currentItems = Number(itemsCount) || 0;

    // Find the weight factor from the dynamic rules store
    const ruleWeightFactor = getWeightForGoods(currentGoods);

    const hasGoodsChanged = currentGoods !== prevGoodsTypeRef.current;
    const hasItemsChanged = currentItems !== prevItemsCountRef.current;

    prevGoodsTypeRef.current = currentGoods;
    prevItemsCountRef.current = currentItems;

    if (ruleWeightFactor !== null) {
      const targetWeight = currentItems * ruleWeightFactor;

      // If items count or goods type changed, and either it was auto-calculated or the current weight is 0/unset, update it
      if (hasGoodsChanged || hasItemsChanged) {
        if (weightAutoCalculated || weightNumeric === 0 || weightNumeric === undefined) {
          setValue(`biltis.${index}.weight_numeric`, targetWeight, {
            shouldValidate: true,
            shouldDirty: true,
          });
          setValue(`biltis.${index}.weight_auto_calculated`, true);
        }
      }
    } else {
      // If the goods type no longer matches a rule, but it was previously auto-calculated,
      // we don't necessarily clear it, but we set auto-calculated to false.
      if (weightAutoCalculated && (hasGoodsChanged || hasItemsChanged)) {
        setValue(`biltis.${index}.weight_auto_calculated`, false);
      }
    }
  }, [goodsType, itemsCount, index, setValue, weightAutoCalculated, weightNumeric, getWeightForGoods]);
}

