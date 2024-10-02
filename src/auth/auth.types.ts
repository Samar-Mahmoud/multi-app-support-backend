import { USER_ROLES } from '../users/users.types';

/**
 * user stored in the `Request` object after auth
 */
export type RequestUser = {
  userId: string;
  userRole: USER_ROLES;
};

/**
 * request after auth contains user's id and role
 */
export type AuthedRequest = Request & {
  user: RequestUser;
};
