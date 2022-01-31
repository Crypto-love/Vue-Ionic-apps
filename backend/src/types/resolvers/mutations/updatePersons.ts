import { ForbiddenError } from 'apollo-server-errors';
import { mutationField, stringArg } from 'nexus';

export const updatePerson = mutationField('updatePerson', {
  type: 'Person',
  args: {
    jsonData: stringArg()
  },
  resolve: async (_parent, { jsonData }, ctx) => {
    const person = JSON.parse(jsonData);
    const phoneWithCountryCode = person.country_code
      ? person.country_code.concat(person.phone)
      : person.phone;
    let userTypeId;
    //check if mobile number already exist
    if (person.user_id) {
      userTypeId = await ctx.prisma.user.findUnique({
        where: {
          id: person.user_id
        },
        select: {
          user_type_id: true
        }
      });
      userTypeId = userTypeId.user_type_id;
    } else {
      userTypeId = -1;
    }
    const checkMobileNumber = await ctx.prisma.person.findFirst({
      where: {
        phone: phoneWithCountryCode,
        position: 'key contact',
        id: person.id
      }
    });
    //if country code is NA then this was to update active value
    if (checkMobileNumber && person.country_code) {
      throw new ForbiddenError('This mobile number already exist!');
      return;
    }
    //update if already exists
    if (person?.id) {
      return ctx.prisma.person.update({
        data: {
          active: person.active,
          customer_id: person.customer_id,
          email: person.email,
          fax: person.fax,
          first_name: person.first_name,
          is_default: person.is_default,
          last_name: person.last_name,
          phone: phoneWithCountryCode,
          position: person.position
        },
        where: {
          id: person.id
        }
      });
    }
    //insert if new
    else {
      return ctx.prisma.person.create({
        data: {
          active: person.active,
          customer_id: person.customer_id,
          email: person.email,
          fax: person.fax,
          first_name: person.first_name,
          is_default: person.is_default,
          last_name: person.last_name,
          phone: person.country_code.concat(person.phone),
          position: person.position
        }
      });
    }
  }
});
