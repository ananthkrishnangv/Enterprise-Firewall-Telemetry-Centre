import nodemailer from 'nodemailer';
import { settingsStore } from '../storage/settings.store.js';

export interface AlertPayload {
  title: string;
  message: string;
  severity: 'critical' | 'high' | 'warning' | 'info';
  type: 'serious_attack' | 'ddos_flood' | 'firewall_down' | 'bandwidth_low' | 'resource_threshold' | 'test';
  timestamp?: string;
  details?: Record<string, any>;
}

export class NotificationService {
  /**
   * Send an alert notification via enabled channels (SMTP Email and/or Telegram Bot)
   */
  public async sendAlert(alert: AlertPayload): Promise<{ smtpSent: boolean; telegramSent: boolean; error?: string }> {
    const settings = settingsStore.getSettings();
    const { notifications, branding } = settings;
    let smtpSent = false;
    let telegramSent = false;
    const time = alert.timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Check trigger filter
    if (alert.type !== 'test') {
      const triggers = notifications.triggers;
      if (alert.type === 'serious_attack' && !triggers.seriousAttackEnabled) return { smtpSent: false, telegramSent: false };
      if (alert.type === 'ddos_flood' && !triggers.ddosEnabled) return { smtpSent: false, telegramSent: false };
      if (alert.type === 'firewall_down' && !triggers.firewallDownEnabled) return { smtpSent: false, telegramSent: false };
      if (alert.type === 'bandwidth_low' && !triggers.bandwidthLowEnabled) return { smtpSent: false, telegramSent: false };
    }

    // 1. Send via Telegram if enabled
    if (notifications.telegram?.enabled && notifications.telegram?.botToken && notifications.telegram?.chatId) {
      try {
        const severityEmoji = alert.severity === 'critical' ? '🚨 CRITICAL' : alert.severity === 'high' ? '⚠️ HIGH' : 'ℹ️ NOTICE';
        const text = `
<b>${severityEmoji}: ${alert.title}</b>

🏛 <b>Org:</b> ${branding.orgName} (${branding.orgDivision})
⏰ <b>Time:</b> ${time}
🛡 <b>Gateway:</b> FortiGate-CSIR-SERC (10.10.3.15)
📝 <b>Details:</b> ${alert.message}
${alert.details ? `\n<pre>${JSON.stringify(alert.details, null, 2)}</pre>` : ''}
<i>— CSIR-SERC Security Operations Automated Alert</i>
`.trim();

        const tgRes = await fetch(`https://api.telegram.org/bot${notifications.telegram.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: notifications.telegram.chatId,
            text,
            parse_mode: 'HTML'
          })
        });
        const tgData = await tgRes.json();
        if (tgData.ok) {
          telegramSent = true;
          console.log(`[NotificationService] Telegram alert dispatched successfully to ${notifications.telegram.chatId}`);
        } else {
          console.warn(`[NotificationService] Telegram API failed: ${tgData.description}`);
        }
      } catch (err: any) {
        console.error(`[NotificationService] Telegram dispatch error: ${err.message}`);
      }
    }

    // 2. Send via SMTP if enabled
    if (notifications.smtp?.enabled && notifications.smtp?.host && notifications.smtp?.toEmails) {
      try {
        const transporter = nodemailer.createTransport({
          host: notifications.smtp.host,
          port: notifications.smtp.port,
          secure: notifications.smtp.secure,
          auth: notifications.smtp.user ? {
            user: notifications.smtp.user,
            pass: notifications.smtp.password || ''
          } : undefined,
          tls: { rejectUnauthorized: false }
        });

        const subject = `[${alert.severity.toUpperCase()} ALERT] ${alert.title} - ${branding.orgName}`;
        const html = `
          <div style="font-family: 'Noto Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0e051e; color: #f1f5f9; border-radius: 12px; overflow: hidden; border: 1px solid #7c3aed;">
            <div style="background: linear-gradient(90deg, #7c3aed, #d946ef); padding: 18px 24px;">
              <h2 style="margin: 0; color: #ffffff; font-size: 18px;">${alert.title}</h2>
              <p style="margin: 4px 0 0 0; color: #e9d5ff; font-size: 12px;">${branding.orgName} • ${branding.orgDivision}</p>
            </div>
            <div style="padding: 24px;">
              <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">${alert.message}</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #332057; color: #94a3b8;">Severity:</td><td style="padding: 8px; border-bottom: 1px solid #332057; font-weight: bold; color: ${alert.severity === 'critical' ? '#ef4444' : '#f59e0b'};">${alert.severity.toUpperCase()}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #332057; color: #94a3b8;">Timestamp:</td><td style="padding: 8px; border-bottom: 1px solid #332057; font-family: monospace;">${time}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #332057; color: #94a3b8;">Firewall:</td><td style="padding: 8px; border-bottom: 1px solid #332057;">FortiGate-CSIR-SERC (10.10.3.15)</td></tr>
              </table>
              ${alert.details ? `<pre style="background: #190a36; padding: 12px; border-radius: 8px; font-size: 11px; margin-top: 16px; overflow-x: auto; color: #a5f3fc;">${JSON.stringify(alert.details, null, 2)}</pre>` : ''}
            </div>
            <div style="padding: 12px 24px; background: #07020f; font-size: 11px; color: #64748b; border-top: 1px solid #1f103d;">
              ${branding.footerNotice}
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: notifications.smtp.fromEmail || `no-reply@serc.res.in`,
          to: notifications.smtp.toEmails,
          subject,
          html
        });
        smtpSent = true;
        console.log(`[NotificationService] SMTP alert email dispatched to ${notifications.smtp.toEmails}`);
      } catch (err: any) {
        console.error(`[NotificationService] SMTP dispatch error: ${err.message}`);
      }
    }

    return { smtpSent, telegramSent };
  }

  /**
   * Diagnostic test function for SMTP configuration
   */
  public async testSMTP(config: any): Promise<{ success: boolean; message: string }> {
    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port ? parseInt(config.port, 10) : 587,
        secure: config.secure === true || config.secure === 'true',
        auth: config.user ? {
          user: config.user,
          pass: config.password || ''
        } : undefined,
        tls: { rejectUnauthorized: false }
      });

      // Verify connection configuration
      await transporter.verify();

      // If toEmails is provided, attempt test send
      if (config.toEmails) {
        await transporter.sendMail({
          from: config.fromEmail || `firewall-alert@serc.res.in`,
          to: config.toEmails,
          subject: `[TEST] CSIR-SERC Firewall Notification System Verification`,
          text: `This is a test notification from CSIR-SERC Firewall Operations Platform. If you received this, SMTP alert delivery is working correctly.`
        });
        return { success: true, message: `SMTP verification & test email delivered successfully to ${config.toEmails}.` };
      }

      return { success: true, message: `SMTP server connected and verified successfully at ${config.host}:${config.port}.` };
    } catch (err: any) {
      return { success: false, message: `SMTP test failed: ${err.message}` };
    }
  }

  /**
   * Diagnostic test function for Telegram Bot API
   */
  public async testTelegram(config: any): Promise<{ success: boolean; message: string }> {
    try {
      const { botToken, chatId } = config;
      if (!botToken || !chatId) {
        return { success: false, message: 'Bot token and Chat ID are required.' };
      }

      const text = `
<b>🧪 CSIR-SERC Firewall Notification Test</b>
✅ Telegram Bot Alert Channel is configured and operational!
⏰ <b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
🛡 <b>Gateway:</b> FortiGate-CSIR-SERC (10.10.3.15)
<i>— Council of Scientific & Industrial Research (CSIR)</i>
`.trim();

      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML'
        })
      });

      const data = await res.json();
      if (data.ok) {
        return { success: true, message: `Telegram test alert delivered successfully to Chat ID ${chatId}!` };
      } else {
        return { success: false, message: `Telegram Bot API returned error: ${data.description}` };
      }
    } catch (err: any) {
      return { success: false, message: `Failed to connect to Telegram Bot API: ${err.message}` };
    }
  }

  /**
   * Diagnostic test alert specifically targeted to an individual user's Telegram Chat ID
   */
  public async sendTelegramToUserChat(chatId: string, userName: string, customMessage?: string): Promise<{ success: boolean; message: string }> {
    const settings = settingsStore.getSettings();
    const botToken = settings.notifications?.telegram?.botToken;

    if (!botToken) {
      return {
        success: false,
        message: 'System Telegram Bot Token is not configured in Enterprise Settings. Please configure the Bot Token in Settings -> Notifications first.'
      };
    }

    if (!chatId || !chatId.trim()) {
      return { success: false, message: 'User Telegram Chat ID is empty.' };
    }

    try {
      const text = `
<b>🛡️ CSIR-SERC Security Alert Subscription</b>
Hello <b>${userName}</b>,
${customMessage || 'Your personal Telegram security notification channel has been verified and is active.'}

⏰ <b>Timestamp:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
🏛 <b>Institution:</b> ${settings.branding?.orgName || 'CSIR-SERC Chennai'}
📡 <b>Active Firewall:</b> FortiGate-600F (10.10.3.15)
<i>— CSIR-SERC Centralized Firewall Operations Console</i>
`.trim();

      const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text,
          parse_mode: 'HTML'
        })
      });

      const data = await res.json();
      if (data.ok) {
        return { success: true, message: `Instant Telegram test notification delivered to ${userName} (Chat ID: ${chatId})!` };
      } else {
        return { success: false, message: `Telegram API error: ${data.description}` };
      }
    } catch (err: any) {
      return { success: false, message: `Failed to dispatch Telegram message: ${err.message}` };
    }
  }
}

export const notificationService = new NotificationService();
