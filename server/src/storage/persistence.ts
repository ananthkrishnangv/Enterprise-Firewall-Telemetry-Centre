import fs from 'fs';
import path from 'path';

// Persistent data directory (isolated from application code for OTA update preservation)
const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`[Persistence] Created persistent data directory at: ${DATA_DIR}`);
  } catch (err: any) {
    console.warn(`[Persistence] Could not create directory ${DATA_DIR}: ${err.message}`);
  }
}

export class PersistenceManager {
  private dataDir: string;

  constructor(dir: string = DATA_DIR) {
    this.dataDir = dir;
    if (!fs.existsSync(this.dataDir)) {
      try {
        fs.mkdirSync(this.dataDir, { recursive: true });
      } catch (err) {
        // Ignored if permissions are managed by container root
      }
    }
  }

  public getDataDir(): string {
    return this.dataDir;
  }

  public saveJSON(filename: string, data: any): boolean {
    try {
      const target = path.join(this.dataDir, filename);
      fs.writeFileSync(target, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (err: any) {
      console.error(`[Persistence] Failed to save ${filename}: ${err.message}`);
      return false;
    }
  }

  public loadJSON<T>(filename: string, fallback: T): T {
    try {
      const target = path.join(this.dataDir, filename);
      if (!fs.existsSync(target)) {
        return fallback;
      }
      const raw = fs.readFileSync(target, 'utf-8');
      return JSON.parse(raw) as T;
    } catch (err: any) {
      console.warn(`[Persistence] Error reading ${filename}, using fallback: ${err.message}`);
      return fallback;
    }
  }

  public exists(filename: string): boolean {
    return fs.existsSync(path.join(this.dataDir, filename));
  }

  public getAllBackupData(): Record<string, any> {
    const backup: Record<string, any> = {
      version: '1.2.0',
      timestamp: new Date().toISOString(),
      files: {}
    };

    try {
      const files = fs.readdirSync(this.dataDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const content = fs.readFileSync(path.join(this.dataDir, file), 'utf-8');
            backup.files[file] = JSON.parse(content);
          } catch {
            // Skip unparseable
          }
        }
      }
    } catch (err: any) {
      console.error(`[Persistence] Backup reading failed: ${err.message}`);
    }

    return backup;
  }

  public restoreBackup(backup: Record<string, any>): boolean {
    if (!backup || !backup.files) {
      return false;
    }

    try {
      for (const [filename, content] of Object.entries(backup.files)) {
        if (filename.endsWith('.json')) {
          this.saveJSON(filename, content);
        }
      }
      return true;
    } catch (err: any) {
      console.error(`[Persistence] Backup restoration failed: ${err.message}`);
      return false;
    }
  }
}

export const persistence = new PersistenceManager();
