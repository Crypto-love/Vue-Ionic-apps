import { mutationField, nonNull, arg, stringArg, intArg } from 'nexus';
import { uploadImage } from '../../services/aws/index';
import { UserInputError } from 'apollo-server-errors';
import { getNewDate } from '../../utils/dateTime';

//update supplier basic info
export const updateSupplierBasicInfo = mutationField('updateSupplierBasicInfo', {
  type: 'Boolean',
  args: {
    supplierId: nonNull(intArg()),
    basicInfoJsonData: nonNull(stringArg())
  },
  resolve: async (_, args, ctx) => {
    const basicInfoData = JSON.parse(args.basicInfoJsonData);
    const imageType = basicInfoData.base64_image.split(';')[0].split('/')[1];
    const base64 = basicInfoData.base64_image.split(';')[1];

    const getTenantCustomer = await ctx.prisma.customer.findFirst({
      where: {
        tenant_id: args.supplierId,
        customer_type_id: 3,
        active: true
      }
    });

    const updateBasicInformation = await ctx.prisma.tenant.update({
      data: {
        registration_number: basicInfoData.registration_number,
        tax_registration_number: basicInfoData.tax_registration_number,
        email: basicInfoData.email,
        email_notification: basicInfoData.email_notification,
        first_name: '',
        logo: basicInfoData.name.concat('.', imageType),
        customer: {
          update: {
            data: {
              name: basicInfoData.name,
              profile: basicInfoData.profile,
              halal_products: basicInfoData.halal_certified,
              active: true,
              customer_type_id: 3
            },
            where: {
              id: getTenantCustomer.id
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
      },
      where: {
        id: args.supplierId
      }
    });

    //upload supplier image to S3
    if (imageType && updateBasicInformation) {
      const imageUrl = await uploadImage(`${basicInfoData.name}.${imageType}`, base64, imageType, 'supplier');
      if (!imageUrl) throw new UserInputError('failed to update image, category name not found');
    }

    return updateBasicInformation.id > 0 ? true : false;
  }
});

export const updateSupplierOpeningHours = mutationField('updateSupplierOpeningHours', {
  type: 'Boolean',
  args: {
    supplierId: nonNull(intArg()),
    operatingHoursJsonData: nonNull(stringArg())
  },
  resolve: async (_, args, ctx) => {
    let updateResult = false;
    const operatingHoursData = JSON.parse(args.operatingHoursJsonData);
    const getTenantCustomer = await ctx.prisma.customer.findFirst({
      where: {
        tenant_id: args.supplierId,
        customer_type_id: 3,
        active: true
      }
    });

    for await (const hour of operatingHoursData) {
      const getHourData = await ctx.prisma.hour.findFirst({
        where: {
          customer_id: getTenantCustomer.id,
          day_id: hour.day_id
        }
      });
      const updateHours = await ctx.prisma.hour.update({
        data: {
          open_hour: hour.open_hour,
          open_minute: hour.open_minute,
          close_hour: hour.close_hour,
          close_minute: hour.close_minute,
          active: hour.active
        },
        where: {
          id: getHourData.id
        }
      });

      updateResult = updateHours.id > 0 ? true : false;
    }

    return updateResult;
  }
});

export const updateSupplierDeliveryHours = mutationField('updateSupplierDeliveryHours', {
  type: 'Boolean',
  args: {
    supplierId: nonNull(intArg()),
    deliveryHoursJsonData: nonNull(stringArg())
  },
  resolve: async (_, args, ctx) => {
    let updateResult = false;
    const deliveryHoursData = JSON.parse(args.deliveryHoursJsonData);
    const getTenantCustomer = await ctx.prisma.customer.findFirst({
      where: {
        tenant_id: args.supplierId,
        customer_type_id: 3,
        active: true
      }
    });

    for await (const deliveryDay of deliveryHoursData) {
      const getDeliveryDay = await ctx.prisma.deliveryDay.findFirst({
        where: {
          customer_id: getTenantCustomer.id,
          day_id: deliveryDay.day_id
        }
      });
      const updateDeliveryDay = await ctx.prisma.deliveryDay.update({
        data: {
          open_hour: deliveryDay.open_hour,
          open_minute: deliveryDay.open_minute,
          close_hour: deliveryDay.close_hour,
          close_minute: deliveryDay.close_minute,
          active: deliveryDay.active
        },
        where: {
          id: getDeliveryDay.id
        }
      });

      updateResult = updateDeliveryDay.id > 0 ? true : false;
    }

    return updateResult;
  }
});
//update groupbuy setting can use same API as to add groupbuy setting

//update business settings
export const updateSupplierBusinessSettings = mutationField('updateSupplierBusinessSettings', {
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

    const statmentAccountSettingsCod = await ctx.prisma.supplierStatementOfAccountSetting.update({
      data: {
        frequency_type_id: statementData.cod.frequency_type_id,
        value: statementData.cod.value
      },
      where: {
        id: statementData.cod.id
      }
    });

    const statmentAccountSettings7Day = await ctx.prisma.supplierStatementOfAccountSetting.update({
      data: {
        frequency_type_id: statementData._7day.frequency_type_id,
        value: statementData._7day.value
      },
      where: {
        id: statementData._7day.id
      }
    });

    const statmentAccountSettings15Day = await ctx.prisma.supplierStatementOfAccountSetting.update({
      data: {
        frequency_type_id: statementData._15day.frequency_type_id,
        value: statementData._15day.value
      },
      where: {
        id: statementData._15day.id
      }
    });

    const statmentAccountSettings30Day = await ctx.prisma.supplierStatementOfAccountSetting.update({
      data: {
        frequency_type_id: statementData._30day.frequency_type_id,
        value: statementData._30day.value
      },
      where: {
        id: statementData._30day.id
      }
    });

    const statmentAccountSettings60Day = await ctx.prisma.supplierStatementOfAccountSetting.update({
      data: {
        frequency_type_id: statementData._60day.frequency_type_id,
        value: statementData._60day.value
      },
      where: {
        id: statementData._60day.id
      }
    });

    return addBusinessSettings.id > 0 &&
      statmentAccountSettingsCod &&
      statmentAccountSettings7Day &&
      statmentAccountSettings15Day &&
      statmentAccountSettings30Day &&
      statmentAccountSettings60Day
      ? true
      : false;
  }
});

//update default settings
export const updateSupplierDefaultSettings = mutationField('updateSupplierDefaultSettings', {
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

    const getTenantCustomerAddress = await ctx.prisma.address.findFirst({
      where: {
        customer_id: getTenantCustomer.id,
        address_type_id: 2,
        active: true,
        is_default: true
      }
    });

    const updateDefaultSettings = await ctx.prisma.tenant.update({
      data: {
        tax_rate: defaultSetting.tax_rate,
        paynow: defaultSetting.paynow,
        interbank_fund_transfer: defaultSetting.interbank_fund_transfer,
        cheque: defaultSetting.cheque,
        cash_on_delivery: defaultSetting.cash_on_delivery,
        default_credit_card_term: defaultSetting.default_credit_card_term,
        customer: {
          update: {
            data: {
              address: {
                update: {
                  data: {
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
                    updated_by: billingAddress.created_by,
                    updated_at: getNewDate()
                  },
                  where: {
                    id: getTenantCustomerAddress.id
                  }
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
      const getSupplierPaymentMethodDetailId = await ctx.prisma.supplierPaymentMethodDetail.findFirst({
        where: {
          supplier_payment_method: {
            supplier_id: args.supplierId,
            supplier_payment_method_id: 1
          }
        }
      });
      if (getSupplierPaymentMethodDetailId) {
        const paynow = await ctx.prisma.supplierPaymentMethodDetail.update({
          data: {
            uen_number: postPaymentMethod.paynow.uen_number,
            phone_number: postPaymentMethod.paynow.phone_number,
            company_name: postPaymentMethod.paynow.company_name,
            active: true
          },
          where: {
            id: getSupplierPaymentMethodDetailId.id
          }
        });
      } else {
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
    }

    if (defaultSetting.interbank_fund_transfer) {
      const getSupplierPaymentMethodDetailId = await ctx.prisma.supplierPaymentMethodDetail.findFirst({
        where: {
          supplier_payment_method: {
            supplier_id: args.supplierId,
            supplier_payment_method_id: 2
          }
        }
      });
      if (getSupplierPaymentMethodDetailId) {
        const interbank = await ctx.prisma.supplierPaymentMethodDetail.update({
          data: {
            bank: {
              connect: {
                id: postPaymentMethod.interbank_fund_transfer.bank_id
              }
            },
            account_name: postPaymentMethod.interbank_fund_transfer.account_name,
            account_number: postPaymentMethod.interbank_fund_transfer.account_number,
            active: true
          },
          where: {
            id: getSupplierPaymentMethodDetailId.id
          }
        });
      } else {
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
    }

    if (defaultSetting.cheque) {
      const getSupplierPaymentMethodDetailId = await ctx.prisma.supplierPaymentMethodDetail.findFirst({
        where: {
          supplier_payment_method: {
            supplier_id: args.supplierId,
            supplier_payment_method_id: 3
          }
        }
      });
      if (getSupplierPaymentMethodDetailId) {
        const cheque = await ctx.prisma.supplierPaymentMethodDetail.update({
          data: {
            account_name: postPaymentMethod.cheque.account_name,
            active: true
          },
          where: {
            id: getSupplierPaymentMethodDetailId.id
          }
        });
      } else {
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
    }

    if (defaultSetting.cash_on_delivery) {
      const getSupplierPaymentMethodDetailId = await ctx.prisma.supplierPaymentMethodDetail.findFirst({
        where: {
          supplier_payment_method: {
            supplier_id: args.supplierId,
            supplier_payment_method_id: 4
          }
        }
      });
      if (getSupplierPaymentMethodDetailId) {
        await ctx.prisma.supplierPaymentMethodDetail.update({
          data: {
            active: true
          },
          where: {
            id: getSupplierPaymentMethodDetailId.id
          }
        });
      } else {
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
    }

    return updateDefaultSettings.id > 0 ? true : false;
  }
});
