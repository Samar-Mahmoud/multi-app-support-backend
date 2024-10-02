import { USER_ROLES } from '../users/users.types';

export type AuthedRequest = Request & {
  user: {
    sub: string;
    role: USER_ROLES;
  };
};
