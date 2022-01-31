import { UserInputError } from 'apollo-server-express';
import { mutationField, nonNull, arg } from 'nexus';
/* TODO: TESTING AND WIRING TO FRONTEND
 * Returns the person successfully added
 * @param country_code
 * @param customer_id
 * @param email
 * @param phone
 * @param user_id
 * @param first_name
 * @param last_name
 * @param position
 * @param fax
 * @param id
 * @return person
 * */
export const addPerson = mutationField('addPerson', {
  type: 'Person',
  args: {
    item: nonNull(
      arg({
        type: 'PersonInput'
      })
    )
  },
  resolve: async (_parent, { item }, ctx) => {
    const {
      country_code,
      customer_id,
      email,
      phone,
      user_id,
      first_name,
      last_name,
      position,
      fax,
      active
    } = item;
    let id = item.id;
    const phone_with_country_code = country_code + phone;

    if (!phone_with_country_code) throw new UserInputError('Phone number is required!');

    const user = await ctx.prisma.user.findFirst({
      where: {
        id: user_id
      }
    });
    const user_type_id = user ? user.user_type_id : -1;

    if (!id) {
      let person = await ctx.prisma.person.findFirst({
        where: {
          phone: phone_with_country_code,
          position: 'key contact'
        }
      });

      if ([1, 2].indexOf(user_type_id) == -1 && person) {
        throw new UserInputError('This mobile number already exist!');
      }

      person = await ctx.prisma.person.create({
        data: {
          customer_id,
          first_name,
          last_name,
          email,
          phone,
          fax,
          position: position.toLowerCase()
        }
      });
      id = person.id;
    } else {
      let person = await ctx.prisma.person.findFirst({
        where: {
          phone: phone_with_country_code,
          position: 'key contact',
          id
        }
      });

      if ([1, 2].indexOf(user_type_id) == -1 && person) {
        throw new UserInputError('This mobile number already exist!');
      }

      const data: any = {
        email,
        phone: phone_with_country_code,
        fax,
        first_name,
        last_name,
        position
      };
      if (!active) {
        data.active = active;
      }
      person = await ctx.prisma.person.update({
        data,
        where: { id }
      });
    }
    return await ctx.prisma.person.findUnique({ where: { id } });
  }
});
