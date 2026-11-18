import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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
    if (persistence.exists('users.json')) {
      const loaded = persistence.loadJSON<StoredUser[]>('users.json', []);
      if (loaded && loaded.length > 0) {
        for (const u of loaded) {
          this.users.set(u.username.toLowerCase(), u);
        }
        return;
      }
    }

    // Attempt to load external credentials from isolated file (NEVER COMMITTED TO GIT)
    const credCandidatePaths = [
      process.env.CREDENTIALS_FILE,
      path.resolve(process.cwd(), 'config', 'credentials.json'),
      path.resolve(process.cwd(), 'data', 'credentials.json'),
      path.resolve(persistence.getDataDir(), 'credentials.json')
    ].filter(Boolean) as string[];

    let superadminPass = process.env.SUPERADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
    let cisoPass = process.env.CISO_PASSWORD || '';
    let auditorPass = process.env.AUDITOR_PASSWORD || '';

    for (const p of credCandidatePaths) {
      if (fs.existsSync(p)) {
        try {
          const raw = fs.readFileSync(p, 'utf-8');
          const parsed = JSON.parse(raw);
          if (parsed.auth?.superadmin?.password) superadminPass = parsed.auth.superadmin.password;
          else if (parsed.superadmin?.password) superadminPass = parsed.superadmin.password;

          if (parsed.auth?.admin?.password) cisoPass = parsed.auth.admin.password;
          else if (parsed.admin?.password) cisoPass = parsed.admin.password;

          if (parsed.auth?.auditor?.password) auditorPass = parsed.auth.auditor.password;
          else if (parsed.auditor?.password) auditorPass = parsed.auditor.password;

          console.log(`[Auth] Loaded initial identity credentials from ${p}`);
          break;
        } catch (e: any) {
          console.warn(`[Auth] Failed to parse credentials from ${p}: ${e.message}`);
        }
      }
    }

    // If still empty on cold start, generate secure bootstrap credentials
    const needPersistCreds = !superadminPass || !cisoPass || !auditorPass;
    if (!superadminPass) superadminPass = `Admin@${crypto.randomBytes(4).toString('hex')}!26`;
    if (!cisoPass) cisoPass = `Ciso@${crypto.randomBytes(4).toString('hex')}!26`;
    if (!auditorPass) auditorPass = `Audit@${crypto.randomBytes(4).toString('hex')}!26`;

    if (needPersistCreds) {
      this.writeCredentialsFile({
        superadmin: superadminPass,
        admin: cisoPass,
        auditor: auditorPass
      });
    }

    const superAdminHash = bcrypt.hashSync(superadminPass, 10);
    const adminHash = bcrypt.hashSync(cisoPass, 10);
    const auditorHash = bcrypt.hashSync(auditorPass, 10);

    const defaultUsers: StoredUser[] = [
      {
        id: 'usr-serc-superadmin',
        username: 'superadmin',
        name: 'Super Administrator',
        email: 'superadmin@domain.local',
        role: 'super_admin',
        department: 'ICT & Cyber Security Command',
        badgeNumber: 'SUPERADMIN-01',
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
        name: 'CISO Administrator',
        email: 'ciso@domain.local',
        role: 'admin',
        department: 'National Cyber Security Directorate',
        badgeNumber: 'CISO-01',
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
        name: 'Compliance Auditor',
        email: 'auditor@domain.local',
        role: 'auditor',
        department: 'CERT-In Compliance & Incident Response Division',
        badgeNumber: 'AUDIT-44',
        telegramChatId: '',
        telegramEnabled: false,
        status: 'active',
        isProtected: false,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        passwordHash: auditorHash,
        lastLogin: new Date().toISOString()
      }
    ];

    for (const u of defaultUsers) {
      this.users.set(u.username.toLowerCase(), u);
    }
    persistence.saveJSON('users.json', Array.from(this.users.values()));
  }

  public writeCredentialsFile(passwords: { superadmin?: string; admin?: string; auditor?: string }) {
    try {
      const dataDir = persistence.getDataDir();
      const target = path.join(dataDir, 'credentials.json');
      const payload = {
        notice: 'CONFIDENTIAL: Local identity credentials file. DO NOT COMMIT TO GIT.',
        updatedAt: new Date().toISOString(),
        auth: {
          superadmin: {
            username: 'superadmin',
            password: passwords.superadmin || 'UNCHANGED',
            role: 'super_admin'
          },
          admin: {
            username: 'admin',
            password: passwords.admin || 'UNCHANGED',
            role: 'admin'
          },
          auditor: {
            username: 'auditor',
            password: passwords.auditor || 'UNCHANGED',
            role: 'auditor'
          }
        }
      };
      fs.writeFileSync(target, JSON.stringify(payload, null, 2), { encoding: 'utf-8', mode: 0o600 });
      console.log(`[Auth] Credentials synced to isolated file: ${target} (mode 0600)`);
    } catch (err: any) {
      console.warn(`[Auth] Could not write isolated credentials file: ${err.message}`);
    }
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
