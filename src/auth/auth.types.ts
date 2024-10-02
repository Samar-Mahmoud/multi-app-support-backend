import { USER_ROLES } from '../users/users.types';

export type RequestUser = {
  userId: string;
  userRole: USER_ROLES;
};

export type AuthedRequest = Request & {
  user: RequestUser;
};
