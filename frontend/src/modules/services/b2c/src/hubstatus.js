export function getMaster(data) {
  let master = [];
  if (data.length <= 0) return master;
  let items = getDistinct(data, ['hub_id', 'tenant_name', 'delivery_date']);
  master = items.map((hub) => {
    let item = data.filter(
      (x) =>
        x.hub_id === hub.hub_id &&
        (x.order_tenant_name === hub.tenant_name || x.order_tenant_name == null) &&
        x.delivery_date == hub.delivery_date
    );
    let hub_detail = item[0];
    let floor_numbeer = hub_detail.floor_number == null ? '' : `#${hub_detail.floor_number}`;
    let unit = hub_detail.unit == null ? '' : `-${hub_detail.unit}`;
    let postal_code = hub_detail.postal_code == null ? '' : `S${hub_detail.postal_code}`;
    let countBuyer = getUnique(item.map((x) => x.user_id)).length;
    let hub_items = [];
    let distinctArr = [
      'order_item_id',
      'user_id',
      'is_b2c_pooling',
      'b2c_pooling_qty',
      'sku_id',
      'sku',
      'total_qty',
      'total_price',
      'tax',
      'original_sale_unit_price',
      'original_total_price',
      'original_tax',
      'discount',
      'rank'
    ];
    let nonPooling = getDistinct(
      item.filter((x) => x.is_b2c_pooling === 0),
      distinctArr
    );
    hub_items = hub_items.concat(nonPooling);
    let total_tenant_minimum_order =
      item.length == 1
        ? hub_detail.tenant_minimum_order
        : item.filter((x) => x.tenant_name == hub.tenant_name).map((x) => x.tenant_minimum_order)[0];
    let poolingItem = item.filter((x) => x.is_b2c_pooling === 1);
    let skuItem = getDistinct(poolingItem, distinctArr);
    let skus = getDistinct(skuItem, ['sku_id']);

    let pooling = poolingItem.length == 0 ? [] : getPricePoolingItems(skus, skuItem);

    hub_items = hub_items.concat(pooling);

    let sumPrice = hub_items
      .map((x) => parseFloat(x.total_price) + parseFloat(x.tax))
      .reduce((a, b) => a + b, 0);

    let completion = sumPrice / parseFloat(total_tenant_minimum_order);
    return {
      hub_id: hub_detail.hub_id,
      hub_name: hub_detail.name,
      hub_alias: hub_detail.alias_name,
      buyer_count: countBuyer,
      tenant_name: hub.tenant_name,
      tenant_minimum_order: hub_detail.tenant_minimum_order,
      minimum_order: total_tenant_minimum_order,
      items: hub_items,
      completion: parseFloat(completion) < 1 ? parseFloat(completion * 100).toFixed(2) : 100.0,
      summed_total_price: parseFloat(sumPrice).toFixed(4),
      created_date: !hub_detail.created_at ? '-' : hub_detail.created_at,
      delivery_date: !hub_detail.delivery_date ? '-' : hub_detail.delivery_date,
      contact: hub_detail.contact,
      whatsapp_link: hub_detail.whatsapp_link,
      hub_can_delivery: hub_detail.hub_can_delivery,
      halal_products: hub_detail.halal_products,
      beef_products: hub_detail.beef_products,
      hub: hub_detail.hub,
      address: getAddress(
        hub_detail.floor_number,
        hub_detail.street_number,
        hub_detail.building,
        hub_detail.road,
        hub_detail.unit
      ),
      address_custome: `${hub_detail.road} ${postal_code}`
    };
  });
  return master;
}

function getDistinct(arrObj, lookup = []) {
  var result = [];
  for (var idx of arrObj) {
    var obj = {};
    for (var id in idx) {
      if (lookup.includes(id)) {
        obj[id] = idx[id];
      }
    }
    let canAdd = true;
    for (var i of result) {
      let results = [];
      let index = 0;
      for (var l of lookup) {
        results[index] = obj[l] === i[l];
        index++;
      }
      if (!results.includes(false)) canAdd = false;
    }
    if (canAdd) result.push(obj);
  }
  return result;
}

function getAddress(...param) {
  let address = param.filter((x) => x !== null && x !== '');
  return address.join(',');
}

function getUnique(arr) {
  return arr.filter((value, index, self) => {
    return self.indexOf(value) === index && value !== null;
  });
}

function getPoolingExtendItem(obj) {
  let arr = [];
  for (let i = 0; i < obj.total_qty; i++) {
    obj['temp_qty'] = 1;
    obj['temp_price'] = obj.total_price / obj.total_qty;
    obj['temp_tax'] = obj.tax / obj.total_qty;
    obj['temp_original_total_price'] = obj.original_total_price / obj.total_qty;
    obj['temp_original_tax'] = obj.original_tax / obj.total_qty;
    arr.push(obj);
  }
  return arr;
}

function getPoolingItems(arrObj) {
  let arr = [];
  for (let i of arrObj) {
    let arrItem = getPoolingExtendItem(i);
    arr = arr.concat(arrItem);
  }
  return arr;
}

function getPricePoolingItems(skus, skuItem) {
  let arr = [];
  for (var sku of skus) {
    let hub_item = {};
    hub_item['order_item_id'] = [];
    hub_item['progress_order_item_id'] = [];
    hub_item['user_id'] = [];
    hub_item['progress_user_id'] = [];
    hub_item['is_b2c_pooling'] = 1;

    let sku_detail = skuItem.filter((x) => x.sku_id === sku.sku_id).sort();
    let totalPoolingSkuItemQty = sku_detail.map((x) => x.total_qty).reduce((a, b) => a + b, 0);
    let skuExtendedItem = getPoolingItems(sku_detail);
    let currentPoolingQty = 0;
    let currentPoolingPrice = 0;
    let currentPoolingTax = 0;
    let progressPoolingQty = 0;
    let progressPoolingPrice = 0;
    let progressPoolingTax = 0;

    let curOriginal_sale_unit_price = 0;
    let curOriginal_tax = 0;
    let curOriginal_total_price = 0;
    let curDiscount = 0;
    let curRank = 0;
    let progressOriginal_sale_unit_price = 0;
    let progressOriginal_tax = 0;
    let progressOriginal_total_price = 0;
    let progressDiscount = 0;
    let progressRank = 0;

    let pooling_qty = sku_detail[0].b2c_pooling_qty;
    let indexItem = 0;
    let maxValue =
      totalPoolingSkuItemQty -
      (totalPoolingSkuItemQty > pooling_qty ? totalPoolingSkuItemQty % pooling_qty : 0);
    for (let sei of skuExtendedItem) {
      hub_item['b2c_pooling_qty'] = sei.b2c_pooling_qty;
      hub_item['sku_id'] = sei.sku_id;
      hub_item['sku'] = sei.sku;
      if (maxValue > indexItem && maxValue >= pooling_qty) {
        currentPoolingQty += sei.temp_qty;
        currentPoolingPrice += sei.temp_price;
        currentPoolingTax += sei.temp_tax;

        curOriginal_sale_unit_price = Number(sei.original_sale_unit_price);
        curOriginal_tax += Number(sei.temp_original_tax);
        curOriginal_total_price += Number(sei.temp_original_total_price);
        curDiscount = Number(sei.discount);
        curRank = Number(sei.rank);

        hub_item['order_item_id'].push(sei.order_item_id);
        hub_item['user_id'].push(sei.user_id);
      } else {
        progressPoolingQty += sei.temp_qty;
        progressPoolingPrice += sei.temp_price;
        progressPoolingTax += sei.temp_tax;

        progressOriginal_sale_unit_price = Number(sei.original_sale_unit_price);
        progressOriginal_tax += Number(sei.temp_original_tax);
        progressOriginal_total_price += Number(sei.temp_original_total_price);
        progressDiscount = Number(sei.discount);
        progressRank = Number(sei.rank);

        hub_item['progress_order_item_id'].push(sei.order_item_id);
        hub_item['progress_user_id'].push(sei.user_id);
      }
      indexItem++;
    }

    hub_item['order_item_id'] = getUnique(hub_item['order_item_id']);
    hub_item['progress_order_item_id'] = getUnique(hub_item['progress_order_item_id']);
    hub_item['user_id'] = getUnique(hub_item['user_id']);
    hub_item['progress_user_id'] = getUnique(hub_item['progress_user_id']);
    hub_item['total_qty'] = currentPoolingQty;
    hub_item['progress_total_qty'] = progressPoolingQty;
    hub_item['total_price'] = currentPoolingPrice;
    hub_item['original_sale_unit_price'] = curOriginal_sale_unit_price;
    hub_item['original_tax'] = curOriginal_tax;
    hub_item['original_total_price'] = curOriginal_total_price;
    hub_item['discount'] = curDiscount;
    hub_item['rank'] = curRank;
    hub_item['progress_total_price'] = progressPoolingPrice;
    hub_item['tax'] = currentPoolingTax;
    hub_item['progress_tax'] = progressPoolingTax;
    arr.push(hub_item);
  }
  return arr;
}
