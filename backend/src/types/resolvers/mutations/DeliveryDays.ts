import { mutationField, stringArg } from 'nexus';

export const addDeliveryDays = mutationField('addDeliveryDays', {
  type: 'DeliveryDay',
  args: {
    jsonData: stringArg()
  },
  resolve: async (_, { jsonData }, ctx) => {
    const newData = JSON.parse(jsonData);
    for (let index = 0; index < newData.length; index++) {
      const deliveryDay = newData[index];
      const cekData = await ctx.prisma.deliveryDay.findFirst({
        where: {
          customer_id: deliveryDay.customer_id,
          day_id: deliveryDay.day_id
        }
      });
      if (!cekData) {
        const createDeliveryDay = await ctx.prisma.deliveryDay.create({
          data: {
            day: {
              connect: {
                id: deliveryDay.day_id
              }
            },
            Tenant: {
              connect: {
                id: deliveryDay.customer_id
              }
            }
          }
        });
      }
    }
    return ctx.prisma.deliveryDay.findFirst({
      where: {
        customer_id: newData[newData.length - 1].customer_id,
        day_id: newData[newData.length - 1].day_id
      }
    });
  }
});

export const deleteDeliveryDays = mutationField('deleteDeliveryDays', {
  type: 'DeliveryDay',
  args: {
    jsonData: stringArg()
  },
  resolve: async (_, { jsonData }, ctx) => {
    const data = JSON.parse(jsonData);
    const cekData = await ctx.prisma.deliveryDay.findFirst({
      where: {
        customer_id: data.customer_id,
        day_id: data.day_id
      }
    });
    if (cekData) {
      await ctx.prisma.deliveryDay.delete({
        where: {
          id: data.id
        }
      });
    }
    return ctx.prisma.deliveryDay.findFirst({
      where: {
        customer_id: data.customer_id,
        day_id: data.day_id
      }
    });
  }
});
