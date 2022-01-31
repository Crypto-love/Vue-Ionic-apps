import { mutationField, nonNull, arg } from 'nexus';
/* TODO: TESTING AND WIRING TO FRONTEND
 * Returns status add or update favourite kus
 * @param account_number
 * @param user_id
 * @param list_sku_id list sku
 * @return status success (true or error)
 * */
export const addFavouriteKus = mutationField('addFavouriteKus', {
  type: 'Boolean',
  args: {
    item: nonNull(
      arg({
        type: 'FavouriteKusInput'
      })
    )
  },
  resolve: async (_parent, { item }, ctx) => {
    const { account_number, user_id, list_sku_id } = item;
    for await (const sku_id of list_sku_id) {
      const favourite_skus = await ctx.prisma.favouriteSku.findFirst({
        where: {
          account_number,
          sku_id
        }
      });

      if (favourite_skus) {
        const favourite_id = favourite_skus.id;
        await ctx.prisma.favouriteSku.update({
          data: {
            updated_by: user_id,
            active: true
          },
          where: {
            id: favourite_id
          }
        });
      } else {
        await ctx.prisma.favouriteSku.create({
          data: {
            account_number,
            user_id,
            sku_id,
            created_by: user_id
          }
        });
      }
    }
    return true;
  }
});
