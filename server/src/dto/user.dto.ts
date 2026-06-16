import type { User, UserRole, ServiceType } from '@prisma/client';

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  emailVerified: boolean;
  termsAccepted: boolean;
  allowPromotions: boolean;
  interestedServices: ServiceType[];
  createdAt: string;
  updatedAt: string;
};

// Explicitly list every exposed field — never spread the Prisma row (database.md §5.3).
export function toUserDTO(user: User): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    emailVerified: user.emailVerified,
    termsAccepted: user.termsAccepted,
    allowPromotions: user.allowPromotions,
    interestedServices: user.interestedServices,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
