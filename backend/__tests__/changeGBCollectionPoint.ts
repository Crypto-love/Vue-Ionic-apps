import { HubSpreeData, PreOrder, preOrderItem, Sku, customer } from '@treedots/prisma';
import { createTestContext } from './__helper';
import { dummyB2cUser } from './__testData';

const context = createTestContext(dummyB2cUser);
const today = new Date();

const dummySpree = ({
  id: 20,
  advocate_id: 2,
  hub_id: 3074,
  tenant_id: 1,
  delivery_date: today.toISOString(),
  start_date: today.toISOString(),
  end_date: today.toISOString(),
  Status: 0,
  active: true,
  hub: {
    addresses: [
      {
        road: 'road_unit_test',
        street_number: 'num_unit_test',
        country: {
          description: 'Singapore',
          currency_symbol: 'S$'
        },
        postal_code: 12345
      }
    ]
  }
} as any) as HubSpreeData;

const dummyPreOrder = ({
  id: 1,
  order_status_id: -2,
  delivery_date: today.toISOString(),
  close_date: today.toISOString(),
  spree_id: 20,
  user: {
    id: 2208,
    email: 'demo_b2c@gmail.com',
    first_name: 'unit test first name',
    last_name: 'unit test last name'
  },
  pre_order_item: [
    {
      id: 1202,
      order_id: 1,
      sku_id: 1,
      order_item_status_id: 1,
      customer_buyer_id: 1,
      active: 1,
      total_qty: 2,
      total_price: 45.0012,
      tax: 6.023,
      sku: {
        id: 1,
        name: 'unit test item name',
        is_b2c_pooling: true
      },
      product: {}
    }
  ],
  order_status: {
    name: 'B2C Processed'
  }
} as unknown) as PreOrder;

const dummyPreOrderItem = ([
  {
    id: 1202,
    order_id: 1,
    sku_id: 1,
    order_item_status_id: 1,
    customer_buyer_id: 1,
    active: 1,
    total_qty: 2,
    total_price: 45.0012,
    tax: 6.023,
    sku: {
      id: 1,
      name: 'unit test item name',
      is_b2c_pooling: true
    },
    product: {}
  }
] as unknown) as preOrderItem[];

const dummyCustomer = ({
  id: 1,
  tenant_id: 1,
  customer_type_id: 3,
  active: true,
  name: 'Treedots'
} as unknown) as customer;

async function changeGBCollectionPoint(orderId: number, newSpreeId: number, appMode = 'development') {
  try {
    return await context.client.setHeader('Authorization', context.token).request(
      `mutation changeGBCollectionPoint {
        changeGBCollectionPoint(orderId: ${orderId}, newSpreeId: ${newSpreeId}, appMode: "${appMode}") {
          id
          spree_id
          delivery_date
          close_date
        }
      }`
    );
  } catch (error) {
    return error.response || error;
  }
}

describe('ensure that', () => {
  it("user can't update collection point because of invalid order", async () => {
    const result = await changeGBCollectionPoint(1, 1);

    expect(result).toMatchObject({
      data: {
        changeGBCollectionPoint: null
      },
      errors: [
        {
          message: 'Order not found'
        }
      ]
    });
  });

  it("user can't update collection point because of invalid new spree", async () => {
    context.prisma.preOrder.findUnique.mockResolvedValueOnce(dummyPreOrder);

    const result = await changeGBCollectionPoint(1, 1);

    expect(result).toMatchObject({
      data: {
        changeGBCollectionPoint: null
      },
      errors: [
        {
          message: 'Spree is not available'
        }
      ]
    });
  });

  it("user can't update collection point because of new spree is similar with the old spree", async () => {
    context.prisma.preOrder.findUnique.mockResolvedValueOnce(dummyPreOrder);
    context.prisma.hubSpreeData.findUnique.mockResolvedValueOnce(dummySpree);
    context.prisma.hubSpreeData.findFirst.mockResolvedValueOnce(dummySpree);

    const result = await changeGBCollectionPoint(1, 1);

    expect(result).toMatchObject({
      data: {
        changeGBCollectionPoint: null
      },
      errors: [
        {
          message: 'Cannot replace same collection point'
        }
      ]
    });
  });

  it("user can't update collection point because old spree and new spree have a different tenant id", async () => {
    const dummyNewSpree = { ...dummySpree, id: 21, tenant_id: 2 };
    context.prisma.preOrder.findUnique.mockResolvedValueOnce(dummyPreOrder);
    context.prisma.hubSpreeData.findUnique.mockResolvedValueOnce(dummySpree);
    context.prisma.hubSpreeData.findFirst.mockResolvedValueOnce(dummyNewSpree);

    const result = await changeGBCollectionPoint(1, 1);

    expect(result).toMatchObject({
      data: {
        changeGBCollectionPoint: null
      },
      errors: [
        {
          message: 'Tenant of old spree and new spree is different'
        }
      ]
    });
  });

  it("user can update order's collection point that contains non-pooling item", async () => {
    const dummyNewSpree = { ...dummySpree, id: 21, hub_id: 1440 };
    const oldPreOrder = {
      ...dummyPreOrder,
      ...dummyPreOrderItem
    };
    const newPreOrder = ({
      ...oldPreOrder,
      spree_id: dummyNewSpree.id,
      delivery_date: dummyNewSpree.delivery_date,
      close_date: dummyNewSpree.end_date
    } as any) as PreOrder;

    context.prisma.preOrder.findUnique.mockResolvedValueOnce(oldPreOrder);
    context.prisma.hubSpreeData.findUnique.mockResolvedValueOnce(dummySpree);
    context.prisma.hubSpreeData.findFirst.mockResolvedValueOnce(dummyNewSpree);

    context.prisma.sku.findUnique.mockResolvedValueOnce(({ is_b2c_pooling: false } as any) as Sku);

    context.prisma.preOrder.findUnique.mockResolvedValueOnce(newPreOrder);
    context.prisma.preOrderItem.findMany.mockResolvedValueOnce(dummyPreOrderItem);
    context.prisma.customer.findFirst.mockResolvedValueOnce(dummyCustomer);

    const result = await changeGBCollectionPoint(oldPreOrder.id, dummyNewSpree.id);

    expect(result).toMatchObject({
      changeGBCollectionPoint: {
        id: newPreOrder.id,
        spree_id: newPreOrder.spree_id,
        delivery_date: newPreOrder.delivery_date,
        close_date: newPreOrder.close_date
      }
    });
  });

  it("user can update order's collection point that contains pooling item", async () => {
    const dummyNewSpree = { ...dummySpree, id: 21, hub_id: 1440 };
    const oldPreOrder = {
      ...dummyPreOrder,
      ...dummyPreOrderItem
    };
    const newPreOrder = ({
      ...oldPreOrder,
      spree_id: dummyNewSpree.id,
      delivery_date: dummyNewSpree.delivery_date,
      close_date: dummyNewSpree.end_date
    } as any) as PreOrder;

    context.prisma.preOrder.findUnique.mockResolvedValueOnce(oldPreOrder);
    context.prisma.hubSpreeData.findUnique.mockResolvedValueOnce(dummySpree);
    context.prisma.hubSpreeData.findFirst.mockResolvedValueOnce(dummyNewSpree);

    context.prisma.sku.findUnique.mockResolvedValueOnce(({ is_b2c_pooling: false } as any) as Sku);

    context.prisma.preOrder.findUnique.mockResolvedValueOnce(newPreOrder);
    context.prisma.preOrderItem.findMany.mockResolvedValueOnce(dummyPreOrderItem);
    context.prisma.customer.findFirst.mockResolvedValueOnce(dummyCustomer);

    const result = await changeGBCollectionPoint(oldPreOrder.id, dummyNewSpree.id);

    expect(result).toMatchObject({
      changeGBCollectionPoint: {
        id: newPreOrder.id,
        spree_id: newPreOrder.spree_id,
        delivery_date: newPreOrder.delivery_date,
        close_date: newPreOrder.close_date
      }
    });
  });
});
