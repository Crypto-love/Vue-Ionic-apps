import { booleanArg, intArg, list, mutationField, nonNull, stringArg } from 'nexus';
import { encryptPassword } from '../../utils/chipper';
import { getNewDate } from '../../utils/dateTime';

export const updateSupplierUser = mutationField('updateSupplierUser', {
  type: 'User',
  args: {
    jsonData: nonNull(stringArg())
  },
  resolve: async (_, { jsonData }, ctx) => {
    const updateData = JSON.parse(jsonData);

    if (updateData.id) {
      //update if id available
      return ctx.prisma.user.update({
        data: {
          first_name: updateData.first_name,
          last_name: updateData.last_name,
          image: updateData.image,
          mobile: updateData.mobile,
          email: updateData.email,
          country: updateData.country_id
            ? {
                connect: {
                  id: updateData.country_id
                }
              }
            : undefined,
          userType: updateData.user_type_id
            ? {
                connect: {
                  id: updateData.user_type_id
                }
              }
            : undefined,
          buyer_type: updateData.buyer_type,
          gender: updateData.gender,
          active: updateData.active
        },
        where: {
          id: updateData.id
        }
      });
    } else {
      //create if id not available
      const hashedPassword = await encryptPassword(updateData.password);

      return ctx.prisma.user.create({
        data: {
          first_name: updateData.first_name,
          last_name: updateData.last_name,
          email: updateData.email,
          image: updateData.image,
          passwordV3: hashedPassword,
          mobile: updateData.mobile,
          country: {
            connect: {
              id: updateData.country_id
            }
          },
          userType: {
            connect: {
              id: updateData.user_type_id
            }
          },
          buyer_type: updateData.buyer_type,
          gender: updateData.gender,
          active: updateData.active,
          date_created: getNewDate(),
          status_approval: 1 //set to approved since superadmin create the user
        }
      });
    }
  }
});

export const updateMultipleSupplierActive = mutationField('updateMultipleSupplierActive', {
  type: 'Boolean',
  args: {
    userIdList: nonNull(list(intArg())),
    active: booleanArg()
  },
  resolve: async (_, { userIdList, active }, ctx) => {
    const updateData = await ctx.prisma.user.updateMany({
      data: {
        active: active
      },
      where: {
        id: {
          in: userIdList
        }
      }
    });
    return updateData.count === userIdList.length ? true : false;
  }
});

export const createNewSupplierUserPassword = mutationField('createNewSupplierUserPassword', {
  type: 'User',
  args: {
    userId: nonNull(intArg()),
    newPassword: nonNull(stringArg())
  },
  resolve: async (_, { userId, newPassword }, ctx) => {
    const hashedPassword = await encryptPassword(newPassword);
    return ctx.prisma.user.update({
      data: {
        passwordV3: hashedPassword
      },
      where: {
        id: userId
      }
    });
  }
});

export const deleteSupplierUsers = mutationField('deleteSupplierUsers', {
  type: 'Boolean',
  args: {
    userIdList: nonNull(list(intArg()))
  },
  resolve: async (_, { userIdList }, ctx) => {
    const deleteData = await ctx.prisma.user.deleteMany({
      where: {
        id: {
          in: userIdList
        }
      }
    });

    return deleteData.count > 0 ? true : false;
  }
});
