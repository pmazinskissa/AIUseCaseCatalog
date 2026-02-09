import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthContext } from '../types/auth';
import { Role, Prisma } from '@prisma/client';

const HEADER_CANDIDATES = {
  email: [
    'x-auth-request-email',
    'x-email',
    'x-user-email',
    'x-auth-email',
    'x-forwarded-email'
  ],
  user: [
    'x-auth-request-user',
    'x-user',
    'x-user-id',
    'x-auth-user'
  ],
  groups: [
    'x-auth-request-groups',
    'x-groups'
  ]
};

const normalizeHeaderValue = (value: string | string[] | undefined): string => {
  if (!value) return '';
  return Array.isArray(value) ? value.join(',') : value;
};

const getHeader = (req: Request, names: string[]): string => {
  for (const name of names) {
    const raw = req.headers[name];
    const value = normalizeHeaderValue(raw);
    if (value) return value;
  }
  return '';
};

const parseAdminEmails = (): string[] => {
  const raw = process.env.ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
};

const parseCommitteeEmails = (): string[] => {
  const raw = process.env.COMMITTEE_EMAILS || '';
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
};

const parseAllowedDomains = (): string[] => {
  const raw = process.env.AUTH_EMAIL_DOMAIN || process.env.OAUTH2_PROXY_EMAIL_DOMAINS || 'ssaandco.com';
  return raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
};

const isAllowedDomain = (email: string, allowedDomains: string[]): boolean => {
  if (!email.includes('@')) return false;
  if (allowedDomains.includes('*')) return true;
  const domain = email.split('@').pop() || '';
  return allowedDomains.includes(domain.toLowerCase());
};

const resolveAuthContext = async (req: Request): Promise<AuthContext> => {
  const adminEmails = parseAdminEmails();
  const committeeEmails = parseCommitteeEmails();
  const allowedDomains = parseAllowedDomains();

  const emailHeader = getHeader(req, HEADER_CANDIDATES.email).toLowerCase();
  const userHeader = getHeader(req, HEADER_CANDIDATES.user);
  const fallbackEmail = process.env.DEV_ADMIN_EMAIL || adminEmails[0] || 'dev-admin@ssaandco.com';

  let email = emailHeader;
  let isDevFallback = false;

  // Dev mode impersonation
  if (process.env.NODE_ENV !== 'production' && process.env.DEV_IMPERSONATE_EMAIL) {
    email = process.env.DEV_IMPERSONATE_EMAIL.toLowerCase();
  }

  // Fallback when no auth proxy is present
  if (!email) {
    const defaultEmail = process.env.DEFAULT_AUTH_EMAIL;
    if (!defaultEmail && process.env.NODE_ENV === 'production') {
      throw new Error('Missing authenticated email');
    }
    email = defaultEmail || fallbackEmail;
    isDevFallback = true;
  }

  const isAdmin = adminEmails.includes(email);
  const isCommittee = committeeEmails.includes(email);

  if (!isAdmin && !isAllowedDomain(email, allowedDomains)) {
    throw new Error('Email domain not allowed');
  }

  // Determine role
  let role: Role = Role.SUBMITTER;
  if (isAdmin || isDevFallback) {
    role = Role.ADMIN;
  } else if (isCommittee) {
    role = Role.COMMITTEE;
  }

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Update role if promoted
    if (role !== user.role && (role === Role.ADMIN || (role === Role.COMMITTEE && user.role === Role.SUBMITTER))) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role }
      });
    }
  } else {
    user = await prisma.user.create({
      data: {
        email,
        name: userHeader || null,
        role
      }
    });
  }

  // Get group memberships
  const memberships = await prisma.groupMembership.findMany({
    where: { userId: user.id },
    select: { groupId: true, group: { select: { slug: true } } }
  });

  return {
    userId: user.id,
    email,
    role: user.role,
    isAdmin: user.role === Role.ADMIN,
    isCommittee: user.role === Role.COMMITTEE || user.role === Role.ADMIN,
    groupIds: memberships.map((m) => m.groupId),
    groupSlugs: memberships.map((m) => m.group.slug)
  };
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = await resolveAuthContext(req);
    req.auth = auth;
    return next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    const status = message === 'Email domain not allowed' ? 403 : 401;
    return res.status(status).json({ success: false, error: message });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  if (!req.auth.isAdmin) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  return next();
};

export const requireCommitteeOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  if (!req.auth.isCommittee) {
    return res.status(403).json({ success: false, error: 'Committee or Admin access required' });
  }
  return next();
};

export const buildVisibilityWhere = (auth: AuthContext) => {
  if (auth.isAdmin) return {};

  const clauses: Prisma.UseCaseWhereInput[] = [
    { submitterId: auth.userId },
    { visibilityScope: 'GENERAL' }
  ];

  if (auth.groupIds.length) {
    clauses.push({
      visibilityScope: 'GROUP',
      groups: { some: { groupId: { in: auth.groupIds } } }
    });
  }

  return { OR: clauses };
};
