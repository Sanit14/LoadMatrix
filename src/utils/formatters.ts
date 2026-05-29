export function formatWeight(weight: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(weight) + ' kg';
}

export function formatChallanNo(challanNo: string): string {
  return challanNo.trim().toUpperCase();
}
