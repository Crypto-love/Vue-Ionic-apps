import { OrderItemStatus } from '@treedots/prisma';
import { createTestContext } from './__helper';
import { dummyB2cUser } from './__testData';

const ctx = createTestContext(dummyB2cUser);

const dummyOrderItemStatuses = ([
  {
    id: -2,
    name: 'Processing in Hub',
    description: 'B2B Order Processing',
    active: true
  },
  {
    id: -1,
    name: 'Processed in Hub',
    description: 'Hub Order Processed',
    active: true
  },
  {
    id: 1,
    name: 'Processing',
    description: 'When tenant still processing the item',
    active: true
  },
  {
    id: 2,
    name: 'Processed',
    description: 'When tenant confirmed the item',
    active: true
  },
  {
    id: 7,
    name: 'Delivering',
    description: 'When item is being delivered',
    active: true
  },
  {
    id: 8,
    name: 'Arrived',
    description: "When driver is arrived on customer's location",
    active: true
  }
] as any) as OrderItemStatus[];

async function getOrderItemStatuses(ids: Array<number> = null) {
  try {
    return await ctx.client.setHeader('Authorization', ctx.token).request(
      `
      query getOrderItemStatuses($active: Boolean, $ids: [Int]){
        getOrderItemStatuses(active: $active, ids: $ids) {
          id
          name
          description
          active
        }
      }
    `,
      {
        active: true,
        ids: ids
      }
    );
  } catch (e) {
    return e.response || e;
  }
}

describe('ensure that', function () {
  it('user get all active order item status', async () => {
    ctx.prisma.orderItemStatus.findMany.mockResolvedValueOnce(dummyOrderItemStatuses);

    const result = await getOrderItemStatuses();

    expect(result).toMatchObject({
      getOrderItemStatuses: dummyOrderItemStatuses
    });
  });

  it('user can order item statuses by pass the ids', async () => {
    const ids = [-1, 2];
    const filteredData = dummyOrderItemStatuses.filter((v) => ids.includes(v.id));
    ctx.prisma.orderItemStatus.findMany.mockResolvedValueOnce(filteredData);

    const result = await getOrderItemStatuses(ids);

    expect(result).toMatchObject({
      getOrderItemStatuses: filteredData
    });
  });
});
