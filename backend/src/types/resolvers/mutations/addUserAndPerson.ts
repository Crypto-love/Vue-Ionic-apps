import { UserInputError } from 'apollo-server-express';
import { mutationField, nonNull, arg } from 'nexus';
import { decipher } from '../../utils/chipper';
import { hash } from 'bcryptjs';
/* TODO: TESTING AND WIRING TO FRONTEND
 * Returns status add user and person. If success return true, else return false
 * @param country_code
 * @param customer_id
 * @param email
 * @param phone
 * @param country_id
 * @param first_name
 * @param last_name
 * @param position
 * @param tenant_customer_id
 * @return status success (true or false)
 * */
export const addUserAndPerson = mutationField('addUserAndPerson', {
  type: 'Boolean',
  args: {
    item: nonNull(
      arg({
        type: 'UserAndPersonInput'
      })
    )
  },
  resolve: async (_parent, { item }, ctx) => {
    const {
      country_code,
      customer_id,
      email,
      phone,
      country_id,
      first_name,
      last_name,
      position,
      tenant_customer_id
    } = item;
    const phone_with_country_code = country_code + phone;
    let user;
    if (email) {
      user = await ctx.prisma.user.findFirst({
        where: {
          OR: [
            {
              mobile: phone_with_country_code
            },
            {
              email
            }
          ]
        }
      });
    } else {
      user = await ctx.prisma.user.findFirst({
        where: {
          mobile: phone_with_country_code
        }
      });
    }

    const decipherFunction = decipher();
    const sterilizedPassword = await decipherFunction('747b7a79787f7e7d');
    const hashedPassword = await hash(sterilizedPassword, 10);

    if (!user) {
      user = await ctx.prisma.user.create({
        data: {
          email,
          mobile: phone_with_country_code,
          password: hashedPassword,
          first_name,
          last_name,
          user_type_id: 6,
          buyer_type: 1
        }
      });
    }
    if (!user) throw new UserInputError('Can not create user');
    const existing_user_id = user.id;

    await ctx.prisma.userCustomer.create({
      data: {
        customer_id,
        user_id: existing_user_id
      }
    });

    const userCustomer = await ctx.prisma.userCustomer.findFirst({
      where: {
        customer_id: tenant_customer_id,
        user_id: existing_user_id
      }
    });
    if (!userCustomer) {
      await ctx.prisma.userCustomer.create({
        data: {
          customer_id: tenant_customer_id,
          user_id: existing_user_id
        }
      });
    }

    const persons = await ctx.prisma.person.findFirst({
      where: {
        phone: phone_with_country_code,
        position: 'key contact'
      }
    });
    if (persons) throw new UserInputError('This mobile number already exist!');

    await ctx.prisma.person.create({
      data: {
        customer_id,
        first_name,
        last_name,
        email,
        phone: phone_with_country_code,
        position
      }
    });

    return true;
  }
});
