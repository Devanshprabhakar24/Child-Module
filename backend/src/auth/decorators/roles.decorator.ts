import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@wombto18/shared';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
