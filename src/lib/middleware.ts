import { NextRequest } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './server-auth';
import { prisma } from './prisma';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: number;
    email: string;
    roleId: number;
    role: string;
  };
}

export async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return null;
  }

  // Get user role
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { role: true },
  });

  if (!user || !user.isActive) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    roleId: user.roleId,
    role: user.role.name,
  };
}

export function hasRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest) => {
    const user = await authenticate(request);
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasRole(user.role, allowedRoles)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    return user;
  };
}
