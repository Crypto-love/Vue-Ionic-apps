export async function checkPreOrderForUncapturedPayment(prismaCtx) {
  return await prismaCtx.preOrder.count({
    where: {
      payment_status_id: 2
    }
  });
}
