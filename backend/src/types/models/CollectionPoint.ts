import { objectType } from 'nexus';

export const CollectionPointStatusPagination = objectType({
  name: 'CollectionPointStatusPagination',
  definition(t) {
    t.list.field('CollectionPointStatusHeader', { type: CollectionPointStatusHeader });
    t.int('total_rows');
    t.int('total_page');
  }
});

export const CollectionPointStatusHeader = objectType({
  name: 'CollectionPointStatusHeader',
  definition(t) {
    t.string('collection_point_name');
    t.string('supplier');
    t.int('total_buyer');
    t.decimal('total_Purchase');
    t.decimal('minimum_order');
    t.decimal('completion');
    t.string('delivery_date');
    t.list.field('details', { type: CollectionPointStatusDetails });
  }
});

export const CollectionPointStatusDetails = objectType({
  name: 'CollectionPointStatusDetails',
  definition(t) {
    t.string('sku');
    t.boolean('pooling');
    t.int('quantity');
    t.string('in_progress');
    t.string('outstanding');
    t.list.field('buyer_info', { type: CollectionPointStatusBuyerInfo });
  }
});

export const CollectionPointStatusBuyerInfo = objectType({
  name: 'CollectionPointStatusBuyerInfo',
  definition(t) {
    t.string('full_name');
    t.string('mobile');
    t.int('total_order');
    t.decimal('total_price');
    t.string('pooling_status');
  }
});
