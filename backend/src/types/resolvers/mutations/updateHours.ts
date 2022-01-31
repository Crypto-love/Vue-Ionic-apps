import { mutationField, nonNull, stringArg } from 'nexus';

export const updateHours = mutationField('updateHours', {
  type: 'Hour',
  args: {
    jsonData: nonNull(stringArg())
  },
  resolve: async (_parent, { jsonData }, ctx) => {
    const newData = JSON.parse(jsonData);
    for (const hour of newData) {
      //update if already exists
      if (hour?.id) {
        return ctx.prisma.hour.update({
          data: {
            close_hour: hour.close_hour,
            close_minute: hour.close_minute,
            open_hour: hour.open_hour,
            open_minute: hour.open_minute
          },
          where: {
            id: hour.id
          }
        });
      }
      //insert if new
      else {
        const checkIfHourExists = await ctx.prisma.hour.findFirst({
          where: {
            customer_id: hour.customer_id,
            day_id: hour.day_id
          }
        });
        if (!checkIfHourExists)
          await ctx.prisma.hour.create({
            data: {
              customer: {
                connect: {
                  id: hour.customer_id
                }
              },
              day: {
                connect: {
                  id: hour.day_id
                }
              },
              close_hour: hour.close_hour,
              close_minute: hour.close_minute,
              open_hour: hour.open_hour,
              open_minute: hour.open_minute
            }
          });
      }
    }
    return ctx.prisma.hour.findFirst({
      where: {
        customer_id: newData[0].customer_id
      }
    });
  }
});
