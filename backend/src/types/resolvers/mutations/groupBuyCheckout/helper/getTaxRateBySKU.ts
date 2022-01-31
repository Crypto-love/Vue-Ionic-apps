export function getTaxRateBySku(skuData) {
  return Number(skuData.sku.tax_rate) > 0
    ? Number(skuData.sku.tax_rate) / 100
    : Number(skuData.sku.product.tenant.tax_rate) / 100;
}
