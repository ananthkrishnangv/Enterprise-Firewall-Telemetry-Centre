import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole, AuthResponse, CreateUserRequest, UpdateUserRequest } from '../types/index.js';
import { persistence } from './persistence.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ux4g_meity_nccc_national_cyber_grid_secret_2026';
const JWT_EXPIRES_IN = '24h';

interface StoredUser extends User {
  passwordHash: string;
}

class AuthStore {
  private users: Map<string, StoredUser> = new Map();

  constructor() {
    this.initDefaultUsers();
  }

  private initDefaultUsers() {
    // Default system users if not already persisted
    const superAdminHash = bcrypt.hashSync('SuperAdmin@2026!', 10);
    const adminHash = bcrypt.hashSync('NcccAdmin@2026!', 10);
    const auditorHash = bcrypt.hashSync('CertInAudit@2026!', 10);

    const defaultUsers: StoredUser[] = [
      {
        id: 'usr-serc-superadmin',
        username: 'superadmin',
        name: 'Super Administrator',
        email: 'superadmin@serc.res.in',
        role: 'super_admin',
        department: 'CSIR-SERC ICT & Cyber Security Command',
        badgeNumber: 'CSIR-SERC-SUPERADMIN-01',
        telegramChatId: '',
        telegramEnabled: true,
        status: 'active',
        isProtected: true,
        createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
        passwordHash: superAdminHash,
        lastLogin: new Date().toISOString()
      },
      {
        id: 'usr-nccc-001',
        username: 'admin',
        name: 'Shri Rajesh Kumar',
        email: 'ciso.nccc@meity.gov.in',
        role: 'admin',
        department: 'National Cyber Coordination Centre (NCCC) / MeitY',
        badgeNumber: 'GOI-NCCC-CISO-01',
        telegramChatId: '',
        telegramEnabled: false,
        status: 'active',
        isProtected: false,
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        passwordHash: adminHash,
        lastLogin: new Date().toISOString()
      },
      {
        id: 'usr-certin-044',
        username: 'auditor',
        name: 'Dr. Sunita Sharma',
        email: 'audit.lead@cert-in.org.in',
        role: 'auditor',
        department: 'CERT-In Compliance & Incident Response Division',
        badgeNumber: 'CERT-IN-AUDIT-44',
        telegramChatId: '',
        telegramEnabled: false,
        status: 'active',
        isProtected: false,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        passwordHash: auditorHash,
        lastLogin: new Date().toISOString()
      }
    ];

    const loaded = persistence.loadJSON<StoredUser[]>('users.json', defaultUsers);
    for (const u of loaded) {
      this.users.set(u.username.toLowerCase(), u);
    }
    persistence.saveJSON('users.json', Array.from(this.users.values()));
  }

  private toSafeUser(user: StoredUser): User {
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      badgeNumber: user.badgeNumber,
      telegramChatId: user.telegramChatId,
      telegramEnabled: user.telegramEnabled,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      isProtected: user.isProtected
    };
  }

  public login(username: string, password: string): AuthResponse {
    const cleanUsername = username.trim().toLowerCase();
    const user = this.users.get(cleanUsername);
    if (!user) {
      return { success: false, error: 'Invalid Government identity credentials or unauthorized access.' };
    }

    if (user.status === 'disabled') {
      return { success: false, error: 'This user account has been disabled. Please contact the Super Administrator.' };
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid Government identity credentials or unauthorized access.' };
    }

    user.lastLogin = new Date().toISOString();

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      department: user.department,
      badgeNumber: user.badgeNumber
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      success: true,
      token,
      user: this.toSafeUser(user)
    };
  }

  public verifyToken(token: string): User | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = this.users.get(decoded.username);
      if (!user) return null;
      return this.toSafeUser(user);
    } catch {
      return null;
    }
  }

  public getUsers(): User[] {
    return Array.from(this.users.values()).map(u => this.toSafeUser(u));
  }

  public getUserById(id: string): StoredUser | undefined {
    for (const u of this.users.values()) {
      if (u.id === id) return u;
    }
    return undefined;
  }

  public getUserByUsername(username: string): StoredUser | undefined {
    return this.users.get(username.trim().toLowerCase());
  }

  public createUser(data: CreateUserRequest): { success: boolean; user?: User; error?: string } {
    const cleanUsername = data.username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters long.' };
    }

    if (!data.name || data.name.trim().length === 0) {
      return { success: false, error: 'Full name is required.' };
    }

    if (!data.email || !data.email.includes('@')) {
      return { success: false, error: 'Valid email address is required.' };
    }

    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (this.users.has(cleanUsername)) {
      return { success: false, error: `Username "${cleanUsername}" is already taken.` };
    }

    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === data.email.trim().toLowerCase()) {
        return { success: false, error: `Email address "${data.email}" is already registered.` };
      }
    }

    const passwordHash = bcrypt.hashSync(data.password, 10);
    const newUser: StoredUser = {
      id: `usr-${uuidv4().substring(0, 8)}`,
      username: cleanUsername,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role || 'operator',
      department: data.department?.trim() || 'CSIR-SERC ICT Division',
      badgeNumber: data.badgeNumber?.trim() || `SERC-${Math.floor(1000 + Math.random() * 9000)}`,
      telegramChatId: data.telegramChatId?.trim() || '',
      telegramEnabled: !!data.telegramEnabled,
      status: 'active',
      isProtected: false,
      createdAt: new Date().toISOString(),
      passwordHash
    };

    this.users.set(cleanUsername, newUser);
    persistence.saveJSON('users.json', Array.from(this.users.values()));
    return { success: true, user: this.toSafeUser(newUser) };
  }

  public updateUser(id: string, data: UpdateUserRequest): { success: boolean; user?: User; error?: string } {
    const user = this.getUserById(id);
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    if (data.name && data.name.trim()) {
      user.name = data.name.trim();
    }

    if (data.email && data.email.trim()) {
      const cleanEmail = data.email.trim().toLowerCase();
      for (const u of this.users.values()) {
        if (u.id !== user.id && u.email.toLowerCase() === cleanEmail) {
          return { success: false, error: `Email "${cleanEmail}" is already used by another user.` };
        }
      }
      user.email = cleanEmail;
    }

    if (data.password && data.password.trim()) {
      if (data.password.trim().length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }
      user.passwordHash = bcrypt.hashSync(data.password.trim(), 10);
    }

    if (data.role) {
      if (user.isProtected && data.role !== 'super_admin') {
        return { success: false, error: 'Cannot change the role of the primary Super Administrator.' };
      }
      user.role = data.role;
    }

    if (data.department !== undefined) {
      user.department = data.department.trim();
    }

    if (data.badgeNumber !== undefined) {
      user.badgeNumber = data.badgeNumber.trim();
    }

    if (data.telegramChatId !== undefined) {
      user.telegramChatId = data.telegramChatId.trim();
    }

    if (data.telegramEnabled !== undefined) {
      user.telegramEnabled = data.telegramEnabled;
    }

    if (data.status) {
      if (user.isProtected && data.status === 'disabled') {
        return { success: false, error: 'Cannot disable the primary Super Administrator account.' };
      }
      user.status = data.status;
    }

    persistence.saveJSON('users.json', Array.from(this.users.values()));
    return { success: true, user: this.toSafeUser(user) };
  }

  public deleteUser(id: string, currentUserId?: string): { success: boolean; error?: string } {
    const user = this.getUserById(id);
    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    if (user.isProtected || user.role === 'super_admin' || user.username === 'superadmin') {
      return { success: false, error: 'Protected Super Administrator account cannot be deleted.' };
    }

    if (currentUserId && (user.id === currentUserId || user.username === currentUserId)) {
      return { success: false, error: 'You cannot delete your own currently logged-in account.' };
    }

    this.users.delete(user.username);
    persistence.saveJSON('users.json', Array.from(this.users.values()));
    return { success: true };
  }
}

export const authStore = new AuthStore();
