import User from '../users/entities/user.entity';

export type SanitizedUser = Omit<User, 'password'>;

export const sanitizeUser = (user: any): SanitizedUser => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};
