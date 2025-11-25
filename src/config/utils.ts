export const getDiscount = (price: number, percentage: number) => {
  return price * (percentage / 100);
};
