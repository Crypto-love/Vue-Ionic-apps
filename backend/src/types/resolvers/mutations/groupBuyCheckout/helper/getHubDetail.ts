export const getHubDetail = async (ctx, hubId: number) => {
  const hub = await ctx.prisma.customer.findFirst({
    where: { id: hubId, hub: true },
    select: {
      name: true,
      alias_name: true,
      addresses: {
        where: {
          address_type_id: 1
        }
      }
    }
  });
  const hubAddress = `${hub.addresses[0].road} ${hub.addresses[0].city} (${hub.addresses[0].postal_code})`;
  return { hubName: hub.name, hubAliasName: hub.alias_name, hubAddress };
};
