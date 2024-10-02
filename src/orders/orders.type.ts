export const ORDER = [
  'pending',
  'confirmed',
  'canceled',
  'completed',
  'delivered',
] as const;

export type ORDER_STATUS = (typeof ORDER)[number];
