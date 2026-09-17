import { ConfigDiffResult, ConfigDiffChange } from '../types/index.js';

export class ConfigDiffEngine {
  public static compareConfigs(
    firewallId: string,
    previousVersion: string,
    previousConfig: string,
    currentVersion: string,
    currentConfig: string
  ): ConfigDiffResult {
    const prevLines = previousConfig.split(/\r?\n/);
    const currLines = currentConfig.split(/\r?\n/);

    const changes: ConfigDiffChange[] = [];
    const prevSet = new Set(prevLines.map(l => l.trim()));
    const currSet = new Set(currLines.map(l => l.trim()));

    // Find removed lines
    prevLines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed && !currSet.has(trimmed)) {
        changes.push({
          type: 'remove',
          line: idx + 1,
          content: line
        });
      }
    });

    // Find added lines
    currLines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed && !prevSet.has(trimmed)) {
        changes.push({
          type: 'add',
          line: idx + 1,
          content: line
        });
      }
    });

    // Compute risk rating
    let riskRating: ConfigDiffResult['riskRating'] = 'low';
    const criticalKeywords = ['anyany', 'logging disabled', 'drop all', 'admin', 'password', 'secret', 'permit ip any any'];
    const hasCritical = changes.some(c => 
      criticalKeywords.some(kw => c.content.toLowerCase().includes(kw))
    );

    if (hasCritical) {
      riskRating = 'critical';
    } else if (changes.length > 5) {
      riskRating = 'high';
    } else if (changes.length > 0) {
      riskRating = 'medium';
    }

    const summary = `${changes.filter(c => c.type === 'add').length} lines added, ${changes.filter(c => c.type === 'remove').length} lines removed.`;

    return {
      firewallId,
      previousVersion,
      currentVersion,
      timestamp: new Date().toISOString(),
      changes,
      riskRating,
      summary
    };
  }
}
