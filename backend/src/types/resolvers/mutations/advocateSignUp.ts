import { intArg, list, mutationField, nonNull, stringArg } from 'nexus';
import { getNewDate } from '../../utils/dateTime';
import { encryptPassword } from '../../utils/chipper';
import { generateAccountNumber, getXeroCustomerId } from '../../utils/helper';

export const updateAdvocateDetails = mutationField('updateAdvocateDetails', {
  type: 'User',
  args: {
    jsonData: nonNull(stringArg())
  },
  resolve: async (_parent, { jsonData }, ctx) => {
    const data = JSON.parse(jsonData);

    return ctx.prisma.user.update({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        mobile: data.mobile,
        email: data.email,
        country_id: data.country_id,
        referred_number: data.referred_number,
        user_type_id: 11
      },
      where: {
        id: data.id
      }
    });
  }
});

export const advocateApproval = mutationField('advocateApproval', {
  type: 'Boolean',
  args: {
    listId: list(intArg()),
    statusApproval: intArg()
  },
  resolve: async (_parent, { listId, statusApproval }, ctx) => {
    const data =
      statusApproval === 1
        ? {
            status_approval: statusApproval,
            active: true
          }
        : {
            status_approval: statusApproval,
            active: false
          };

    const update = await ctx.prisma.user.updateMany({
      data: data,
      where: {
        id: {
          in: listId
        }
      }
    });
    return update ? true : false;
  }
});

export const updateCollectionPointDetails = mutationField('updateCollectionPointDetails', {
  type: 'Address',
  args: {
    jsonAddressDetails: nonNull(stringArg())
  },
  resolve: async (_parent, { jsonAddressDetails }, ctx) => {
    const addressDetails = JSON.parse(jsonAddressDetails);
    return ctx.prisma.address.update({
      data: {
        country_id: addressDetails.country_id,
        state: addressDetails.state,
        city: addressDetails.city,
        road: addressDetails.road,
        street_number: addressDetails.street_number,
        building: addressDetails.building,
        postal_code: addressDetails.postal_code,
        unit: addressDetails.unit,
        stall: addressDetails.stall,
        floor_number: addressDetails.floor_number,
        active: true,
        latlng: addressDetails.latlng,
        updated_by: ctx.credential.userId
      },
      where: {
        id: addressDetails.id
      }
    });
  }
});

export const verifyCollectionPoint = mutationField('verifyCollectionPoint', {
  type: 'UserCustomer',
  args: {
    userId: intArg(),
    collectionPointId: intArg()
  },
  resolve: async (_parent, { userId, collectionPointId }, ctx) => {
    const getUserCustomerId = await ctx.prisma.userCustomer.findFirst({
      where: {
        user_id: userId,
        customer_id: collectionPointId
      }
    });

    if (getUserCustomerId) {
      await ctx.prisma.userCustomer.update({
        data: {
          active: true,
          customer: {
            update: {
              active: true
            }
          }
        },
        where: {
          id: getUserCustomerId.id
        }
      });
    }

    return getUserCustomerId;
  }
});

export const updateBankAccountDetails = mutationField('updateBankAccountDetails', {
  type: 'BankDetail',
  args: {
    jsonData: stringArg()
  },
  resolve: async (_parent, { jsonData }, ctx) => {
    const bankDetails = JSON.parse(jsonData);
    return ctx.prisma.bankDetail.update({
      data: {
        bank: {
          upsert: {
            create: {
              bank_name: bankDetails.bank_name,
              country: {
                connect: {
                  id: bankDetails.country_id
                }
              }
            },
            update: {
              bank_name: bankDetails.bank_name
            }
          }
        },
        account_number: bankDetails.account_number,
        account_name: bankDetails.account_name,
        bank_code: bankDetails.bank_code,
        branch_code: bankDetails.branch_code
      },
      where: {
        id: bankDetails.id
      }
    });
  }
});

export const verifyBankAccount = mutationField('verifyBankAccount', {
  type: 'BankDetail',
  args: { bankDetailId: intArg() },
  resolve: async (_parent, { bankDetailId }, { prisma }) => {
    // Find hubs that use this unverified bank
    const customerBanks = await prisma.customerBank.findMany({
      where: { bank_detail_id: bankDetailId, active: false }
    });

    const queries = [];
    queries.push(
      prisma.bankDetail.update({
        data: { active: true },
        where: { id: bankDetailId }
      })
    );

    if (customerBanks && customerBanks.length) {
      // Set bankDetail as active
      queries.push(
        prisma.customerBank.updateMany({
          where: { id: { in: customerBanks.map((v) => v.id) } },
          data: { active: true }
        })
      );

      // Delete hub's previous bank
      queries.push(
        prisma.customerBank.deleteMany({
          where: {
            customer_id: { in: customerBanks.map((v) => v.customer_id) },
            bank_detail_id: { not: bankDetailId },
            active: true
          }
        })
      );
    }

    // Execute above queries
    await prisma.$transaction(queries);

    return prisma.bankDetail.findUnique({ where: { id: bankDetailId } });
  }
});

export const addNewAdvocate = mutationField('addNewAdvocate', {
  type: 'Boolean',
  args: {
    jsonData: nonNull(stringArg())
  },
  resolve: async (_, args, ctx) => {
    const data = JSON.parse(args.jsonData);
    const hashedPassword = await encryptPassword(data.password);
    const accountNumber = await generateAccountNumber(ctx.prisma, 2); // 2 = customer / hub
    const xeroCustomerId = await getXeroCustomerId(
      true,
      data.supplier_id,
      {
        accountNumber,
        contactStatus: 'ACTIVE',
        name: data.road,
        isCustomer: true
      },
      ctx.prisma
    );
    const addData = await ctx.prisma.user.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        mobile: data.mobile,
        email: data.email,
        country_id: data.country_id,
        referred_number: data.referred_number,
        user_type_id: 11,
        passwordV3: hashedPassword,
        status_approval: 1,
        date_created: getNewDate(),
        active: true,
        UserCustomer: {
          create: {
            active: true,
            customer: {
              create: {
                account_number: accountNumber,
                name: data.road,
                customer_type_id: 2,
                active: true,
                halal_products: data.isHalalHub,
                beef_products: data.isNoBeef,
                profile: data.profile,
                whatsapp_link: data.whatsapp_link,
                hub: true,
                xero_id: xeroCustomerId,
                address: {
                  create: {
                    address_type_id: 1,
                    country_id: data.country_id,
                    state: data.state,
                    city: data.city,
                    road: data.road,
                    street_number: data.street_number,
                    building: data.building,
                    postal_code: data.postal_code,
                    unit: data.unit,
                    stall: data.stall,
                    floor_number: data.floor_number,
                    active: true,
                    latlng: data.latlng,
                    is_default: true,
                    updated_by: ctx.credential.userId
                  }
                }
              }
            }
          }
        },
        bankDetails: {
          create: {
            bank: {
              connect: {
                id: data.bank_id
              }
            },
            account_name: data.account_name,
            account_number: data.account_number,
            bank_code: data.bank_code,
            branch_code: data.branch_code,
            active: true
          }
        }
      }
    });

    return addData.id > 0 ? true : false;
  }
});

export const addNewCollectionPoint = mutationField('addNewCollectionPoint', {
  type: 'Boolean',
  args: {
    jsonData: nonNull(stringArg())
  },
  resolve: async (_, { jsonData }, ctx) => {
    const data = JSON.parse(jsonData);
    const accountNumber = await generateAccountNumber(ctx.prisma, 2); // 2 = customer / hub
    const xeroCustomerId = await getXeroCustomerId(
      true,
      data.supplier_id, //need discuss to get supplier_id
      {
        accountNumber,
        contactStatus: 'ACTIVE',
        name: data.road,
        isCustomer: true
      },
      ctx.prisma
    );
    const createNewCP = await ctx.prisma.userCustomer.create({
      data: {
        active: true,
        customer: {
          create: {
            account_number: accountNumber,
            name: data.road,
            customer_type_id: 2,
            active: true,
            halal_products: data.isHalalHub,
            beef_products: data.isNoBeef,
            profile: data.profile,
            whatsapp_link: data.whatsapp_link,
            hub: true,
            xero_id: xeroCustomerId,
            address: {
              create: {
                address_type_id: 1,
                country_id: data.country_id,
                state: data.state,
                city: data.city,
                road: data.road,
                street_number: data.street_number,
                building: data.building,
                postal_code: data.postal_code,
                unit: data.unit,
                stall: data.stall,
                floor_number: data.floor_number,
                active: true,
                latlng: data.latlng,
                is_default: true,
                updated_by: ctx.credential.userId
              }
            }
          }
        },
        user: {
          connect: {
            id: data.user_id
          }
        }
      }
    });
    return createNewCP.id ? true : false;
  }
});

export const addNewBankAccount = mutationField('addNewBankAccount', {
  type: 'Boolean',
  args: {
    jsonData: nonNull(stringArg())
  },
  resolve: async (_, { jsonData }, ctx) => {
    const data = JSON.parse(jsonData);
    const addBank = await ctx.prisma.bankDetail.create({
      data: {
        user: {
          connect: {
            id: data.user_id
          }
        },
        bank: {
          connect: {
            id: data.bank_id
          }
        },
        account_name: data.account_name,
        account_number: data.account_number,
        bank_code: data.bank_code,
        branch_code: data.branch_code,
        active: true
      }
    });
    return addBank.id ? true : false;
  }
});

export const linkCollectionPointSupplier = mutationField('linkCollectionPointSupplier', {
  type: 'Boolean',
  args: {
    collectionPointId: nonNull(intArg()),
    supplierId: nonNull(intArg())
  },
  resolve: async (_, { collectionPointId, supplierId }, ctx) => {
    let ret;
    const getCustomerTenantId = await ctx.prisma.customerTenant.findFirst({
      where: {
        customer_id: collectionPointId,
        tenant_id: supplierId,
        active: false
      }
    });
    if (!getCustomerTenantId) {
      ret = await ctx.prisma.customerTenant.create({
        data: {
          customer_id: collectionPointId,
          tenant_id: supplierId,
          active: true
        }
      });
    } else {
      ret = await ctx.prisma.customerTenant.update({
        data: {
          active: true
        },
        where: {
          id: getCustomerTenantId.id
        }
      });
    }
    return ret.id > 0 ? true : false;
  }
});

export const unLinkCollectionPointSupplier = mutationField('unLinkCollectionPointSupplier', {
  type: 'Boolean',
  args: {
    collectionPointId: nonNull(intArg()),
    supplierId: nonNull(intArg())
  },
  resolve: async (_, { collectionPointId, supplierId }, ctx) => {
    const getCustomerTenantId = await ctx.prisma.customerTenant.findFirst({
      where: {
        customer_id: collectionPointId,
        tenant_id: supplierId,
        active: true
      }
    });
    const ret = await ctx.prisma.customerTenant.update({
      data: {
        active: false
      },
      where: {
        id: getCustomerTenantId.id
      }
    });
    console.log('ret', ret);
    return ret.id > 0 ? true : false;
  }
});
