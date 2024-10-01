export const USER = [
  'customer',
  'vendor',
  'rider',
  'admin',
  'tech support',
  'sales',
] as const;

export type USER_ROLES = (typeof USER)[number];
