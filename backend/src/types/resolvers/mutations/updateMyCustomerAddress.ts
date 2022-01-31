import { mutationField, nonNull, arg } from 'nexus';
import { getNewDate } from '../../utils/dateTime';

export const updateMyCustomerAddress = mutationField('updateMyCustomerAddress', {
  type: 'Address',
  args: {
    data: nonNull(
      arg({
        type: 'CustomerAddressInput'
      })
    )
  },
  resolve: async (_parent, { data }, ctx) => {
    const {
      id,
      customer_id,
      floor_number,
      street_number,
      road,
      building,
      unit,
      stall,
      city,
      state,
      postal_code,
      latlng,
      country_id,
      address_type_id,
      active,
      is_default,
      updated_by
    } = data;

    //check if id is passing to update or create new stock location address
    if (id) {
      //prepare address data
      const update = {
        floor_number: floor_number,
        street_number: street_number,
        road: road,
        building: building,
        unit: unit,
        stall: stall,
        city: city,
        state: state,
        postal_code: postal_code,
        latlng: latlng,
        country_id: country_id,
        address_type_id: address_type_id,
        active: active,
        is_default: is_default,
        updated_by: updated_by,
        updated_at: getNewDate()
      };
      //update Address data
      return ctx.prisma.address.update({
        data: update,
        where: { id: id }
      });
    } else {
      //prepare address data
      const create = {
        customer: {
          connect: {
            id: customer_id
          }
        },
        floor_number: floor_number,
        street_number: street_number,
        road: road,
        building: building,
        unit: unit,
        stall: stall,
        city: city,
        state: state,
        postal_code: postal_code,
        latlng: latlng,
        country: {
          connect: {
            id: country_id
          }
        },
        addressType: {
          connect: {
            id: address_type_id
          }
        },
        active: active,
        is_default: is_default,
        created_by: updated_by,
        created_at: getNewDate(),
        updated_by: null,
        updated_at: null
      };
      //create Address data
      return ctx.prisma.address.create({
        data: create
      });
    }
  }
});
