import { UserType } from '@/src/user/types/user.types';

export interface IUserResponse {
  user: UserType & { token: string };
}
