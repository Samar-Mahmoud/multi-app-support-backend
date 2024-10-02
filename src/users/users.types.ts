/*
 * different user roles
 */
export const USER = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  RIDER: 'rider',
  ADMIN: 'admin',
  TECH_SUPPORT: 'tech support',
  SALES: 'sales',
} as const;

export const USER_ROLES_ARR = [
  'customer',
  'vendor',
  'rider',
  'admin',
  'tech support',
  'sales',
] as const;

type UserT = typeof USER;

export type USER_ROLES = UserT[keyof UserT];
