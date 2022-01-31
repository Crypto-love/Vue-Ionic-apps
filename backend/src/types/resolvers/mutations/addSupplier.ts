import { mutationField, nonNull, arg, stringArg, intArg } from 'nexus';
import { getNewDate } from '../../utils/dateTime';
import { encryptPassword } from '../../utils/chipper';
import { uploadImage } from '../../services/aws/index';
import { UserInputError } from 'apollo-server-errors';
import { v4 } from 'uuid';

export const addSupplierBasicInformations = mutationField('addSupplierBasicInformations', {
  type: 'Tenant',
  args: {
    basicInfoJsonData: nonNull(stringArg()),
    operatingHoursJsonData: nonNull(stringArg()),
    deliveryHoursJsonData: nonNull(stringArg()),
    stateListJsonData: nonNull(stringArg()),
    internalUserJsonData: nonNull(stringArg())
  },
  resolve: async (_, args, ctx) => {
    const basicInfoData = JSON.parse(args.basicInfoJsonData);
    const operatingHoursData = JSON.parse(args.operatingHoursJsonData);
    const deliveryHoursData = JSON.parse(args.deliveryHoursJsonData);
    const stateListData = JSON.parse(args.stateListJsonData);
    const internalUserData = JSON.parse(args.internalUserJsonData);
    const imageType = basicInfoData.base64_image.split(';')[0].split('/')[1];
    const base64 = basicInfoData.base64_image.split(';')[1];
    const uuidv4 = await v4();

    for await (const user of internalUserData) {
      const hashedPassword = await encryptPassword(user.password);
      user.passwordV3 = hashedPassword;
      user.date_created = getNewDate();
      user.password = undefined;
    }

    const addBasicInformation = await ctx.prisma.tenant.create({
      data: {
        registration_number: basicInfoData.registration_number,
        tax_registration_number: basicInfoData.tax_registration_number,
        email: basicInfoData.email,
        email_notification: basicInfoData.email_notification,
        first_name: '',
        logo: basicInfoData.name.concat('.', imageType),
        customer: {
          create: {
            name: basicInfoData.name,
            profile: basicInfoData.profile,
            halal_products: basicInfoData.halal_certified,
            active: true,
            customer_type_id: 3,
            hours: {
              createMany: {
                data: operatingHoursData,
                skipDuplicates: true
              }
            },
            DeliveryDay: {
              createMany: {
                data: deliveryHoursData,
                skipDuplicates: true
              }
            },
            SupplierState: {
              createMany: {
                data: stateListData,
                skipDuplicates: true
              }
            }
          }
        },
        //add default stock location
        StockLocation: {
          create: {
            name: basicInfoData.name,
            alias_name: basicInfoData.name,
            group_id: 1,
            collection_type_id: 1,
            created_by: `${ctx.credential.userId}`,
            created_at: getNewDate(),
            //add default stock location lot
            StockLocationsLot: {
              create: {
                lot_number: '0',
                barcode: uuidv4,
                created_at: getNewDate(),
                created_by: 'system',
                shelf_number: '0',
                tier_number: '0'
              }
            }
          }
        },
        //add default team
        TlTeams: {
          create: {
            tl_team: {
              create: {
                name: basicInfoData.name
              }
            }
          }
        }
      },
      include: {
        customer: {
          include: {
            hours: true,
            DeliveryDay: true,
            SupplierState: true
          },
          where: {
            customer_type_id: 3,
            active: true
          },
          take: 1
        }
      }
    });

    //upload supplier image to S3
    if (imageType && addBasicInformation) {
      const imageUrl = await uploadImage(`${basicInfoData.name}.${imageType}`, base64, imageType, 'supplier');
      if (!imageUrl) throw new UserInputError('failed to update image, category name not found');
    }

    //create user, tag to supplier, and upload user image to S3
    for await (const user of internalUserData) {
      const userImageType = user.base64_image.split(';')[0].split('/')[1];
      const userBase64 = user.base64_image.split(';')[1];
      user.base64_image = undefined;
      user.image = `${user.first_name}.${userImageType}`;
      const createUser = await ctx.prisma.user.create({
        data: user
      });
      const tagUserToSupplier = await ctx.prisma.userCustomer.create({
        data: {
          active: true,
          customer_id: addBasicInformation.customer[0].id,
          user_id: createUser.id
        }
      });
      //upload user image to S3
      if (createUser.id > 0) {
        const imageUrl = await uploadImage(
          `${user.first_name}.${userImageType}`,
          userBase64,
          userImageType,
          'profilePictures'
        );
        if (!imageUrl) throw new UserInputError('failed to update image, category name not found');
      }
    }

    return addBasicInformation;
  }
});

export const addGroupBuySettings = mutationField('addGroupBuySettings', {
  type: 'Boolean',
  args: {
    supplierId: nonNull(intArg()),
    groupBuySettingJson: nonNull(stringArg())
  },
  resolve: async (_, args, ctx) => {
    const groupBuySetting = JSON.parse(args.groupBuySettingJson);

    const getTenantCustomer = await ctx.prisma.customer.findFirst({
      where: {
        tenant_id: args.supplierId,
        customer_type_id: 3,
        active: true
      }
    });

    const updateGroupBuySetting = await ctx.prisma.tenant.update({
      data: {
        commission_rate: groupBuySetting.commission_rate,
        lead_days: groupBuySetting.lead_days,
        customer: {
          update: {
            data: {
              minimum_order: groupBuySetting.minimum_order
            },
            where: {
              id: getTenantCustomer.id
            }
          }
        }
      },
      where: {
        id: args.supplierId
      }
    });

    return updateGroupBuySetting.id > 0 ? true : false;
  }
});

export const addBusinessSettings = mutationField('addBusinessSettings', {
  type: 'Boolean',
  args: {
    supplierId: nonNull(intArg()),
    businessDataJson: nonNull(stringArg()),
    statementDataJson: nonNull(stringArg())
  },
  resolve: async (_, args, ctx) => {
    /**
     * === merchant can use the current api
     */
    const businessSetting = JSON.parse(args.businessDataJson);
    const statementData = JSON.parse(args.statementDataJson);

    const getTenantCustomer = await ctx.prisma.customer.findFirst({
      where: {
        tenant_id: args.supplierId,
        customer_type_id: 3,
        active: true
      }
    });

    const addBusinessSettings = await ctx.prisma.tenant.update({
      data: {
        direct_price: businessSetting.direct_price,
        automatic_connection_approval: businessSetting.automatic_connection_approval,
        discoverable: businessSetting.discoverable,
        send_statement_on_regular_basis: businessSetting.send_statement_on_regular_basis
      },
      where: {
        id: args.supplierId
      }
    });

    const statmentAccountSettings = await ctx.prisma.supplierStatementOfAccountSetting.createMany({
      data: [
        {
          supplier_id: args.supplierId,
          statement_type_id: 0,
          frequency_type_id: statementData.cod.frequency_type_id,
          value: statementData.cod.value
        },
        {
          supplier_id: args.supplierId,
          statement_type_id: 1,
          frequency_type_id: statementData._7day.frequency_type_id,
          value: statementData._7day.value
        },
        {
          supplier_id: args.supplierId,
          statement_type_id: 2,
          frequency_type_id: statementData._15day.frequency_type_id,
          value: statementData._15day.value
        },
        {
          supplier_id: args.supplierId,
          statement_type_id: 3,
          frequency_type_id: statementData._30day.frequency_type_id,
          value: statementData._30day.value
        },
        {
          supplier_id: args.supplierId,
          statement_type_id: 4,
          frequency_type_id: statementData._60day.frequency_type_id,
          value: statementData._60day.value
        }
      ]
    });

    return addBusinessSettings.id > 0 && statmentAccountSettings.count > 0 ? true : false;
  }
});

export const addDefaultSettings = mutationField('addDefaultSettings', {
  type: 'Boolean',
  args: {
    supplierId: nonNull(intArg()),
    defaultSettingJson: nonNull(stringArg()),
    billingAddressJson: nonNull(stringArg()),
    postPaymentMethodJson: nonNull(stringArg())
  },
  resolve: async (_, args, ctx) => {
    const defaultSetting = JSON.parse(args.defaultSettingJson);
    const billingAddress = JSON.parse(args.billingAddressJson);
    const postPaymentMethod = JSON.parse(args.postPaymentMethodJson);

    const getTenantCustomer = await ctx.prisma.customer.findFirst({
      where: {
        tenant_id: args.supplierId,
        customer_type_id: 3,
        active: true
      }
    });

    const addDefaultSettings = await ctx.prisma.tenant.update({
      data: {
        tax_rate: defaultSetting.tax_rate,
        paynow: defaultSetting.paynow,
        interbank_fund_transfer: defaultSetting.interbank_transfer,
        cheque: defaultSetting.cheque,
        cash_on_delivery: defaultSetting.cash_on_delivery,
        default_credit_card_term: defaultSetting.default_credit_card_term,
        customer: {
          update: {
            data: {
              address: {
                create: {
                  //set billing address
                  country_id: billingAddress.country_id,
                  state: billingAddress.state,
                  city: billingAddress.city,
                  street_number: billingAddress.street_number,
                  building: billingAddress.building,
                  postal_code: billingAddress.postal_code,
                  floor_number: billingAddress.floor_number,
                  unit: billingAddress.unit,
                  address_type_id: 2,
                  active: true,
                  is_default: true,
                  created_by: billingAddress.created_by
                }
              }
            },
            where: {
              id: getTenantCustomer.id
            }
          }
        }
      },
      where: {
        id: args.supplierId
      }
    });

    if (defaultSetting.paynow) {
      const paynow = await ctx.prisma.supplierPaymentMethodDetail.create({
        data: {
          supplier_payment_method: {
            create: {
              supplier_id: args.supplierId,
              supplier_payment_method_option: {
                connect: {
                  id: 1
                }
              }
            }
          },
          uen_number: postPaymentMethod.paynow.uen_number,
          phone_number: postPaymentMethod.paynow.phone_number,
          company_name: postPaymentMethod.paynow.company_name,
          active: true
        }
      });
    }

    if (defaultSetting.interbank_transfer) {
      const interbank = await ctx.prisma.supplierPaymentMethodDetail.create({
        data: {
          supplier_payment_method: {
            create: {
              supplier_id: args.supplierId,
              supplier_payment_method_option: {
                connect: {
                  id: 2
                }
              }
            }
          },
          bank: {
            connect: {
              id: postPaymentMethod.interbank_fund_transfer.bank_id
            }
          },
          account_name: postPaymentMethod.interbank_fund_transfer.account_name,
          account_number: postPaymentMethod.interbank_fund_transfer.account_number,
          active: true
        }
      });
    }

    if (defaultSetting.cheque) {
      const cheque = await ctx.prisma.supplierPaymentMethodDetail.create({
        data: {
          supplier_payment_method: {
            create: {
              supplier_id: args.supplierId,
              supplier_payment_method_option: {
                connect: {
                  id: 3
                }
              }
            }
          },
          account_name: postPaymentMethod.cheque.account_name,
          active: true
        }
      });
    }

    if (defaultSetting.cash_on_delivery) {
      await ctx.prisma.supplierPaymentMethodDetail.create({
        data: {
          supplier_payment_method: {
            create: {
              supplier_id: args.supplierId,
              supplier_payment_method_option: {
                connect: {
                  id: 4
                }
              }
            }
          },
          active: true
        }
      });
    }

    return addDefaultSettings.id > 0 ? true : false;
  }
});
