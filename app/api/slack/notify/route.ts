import { NextRequest, NextResponse } from 'next/server';

interface SlackNotification {
  text: string;
  username?: string;
  icon_emoji?: string;
  channel?: string;
}

// Add interface for full account data
interface AccountData {
  username: string;
  password: string;
  pageType: string;
  pageTypeStatus: string;
  baseUrl: string;
  startTime: string;
  endTime: string;
  lastWindowAssignment: string | null;
  notes: string;
  calculatedStartTime: string | null;
  calculatedEndTime: string | null;
  active_weekdays: string[];
  language: string;
  proxyHost: string | null;
  proxyPort: string | null;
  proxyUsername: string | null;
  proxyPassword: string | null;
  proxyProtocol: string | null;
}

class SlackService {
  private webhookUrl: string;
  private defaultChannel: string;
  private isEnabled: boolean;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
    this.defaultChannel = process.env.SLACK_CHANNEL || '#developer-activity';
    this.isEnabled = !!this.webhookUrl;
  }

  async sendNotification(notification: SlackNotification): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const payload = {
        text: notification.text,
        username: notification.username || 'NDC Bot',
        icon_emoji: notification.icon_emoji || ':robot_face:',
        channel: notification.channel || this.defaultChannel
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Slack notification failed:', error);
      throw error;
    }
  }

  async notifyAccountAdded(clientName: string, accountData: AccountData): Promise<void> {
    const text = `:white_check_mark: *New Account Added*\n\n*Agency:* ${clientName}\n*Username:* ${accountData.username}\n*Password:* ${accountData.password}\n*Page Type:* ${accountData.pageType} (${accountData.pageTypeStatus})\n*Base URL:* ${accountData.baseUrl}\n*Start Time:* ${accountData.startTime}\n*End Time:* ${accountData.endTime}\n*Language:* ${accountData.language}\n*Active Weekdays:* ${accountData.active_weekdays.join(', ')}\n*Notes:* ${accountData.notes || 'None'}\n*Proxy Host:* ${accountData.proxyHost || 'None'}\n*Proxy Port:* ${accountData.proxyPort || 'None'}\n*Proxy Username:* ${accountData.proxyUsername || 'None'}\n*Proxy Protocol:* ${accountData.proxyProtocol || 'None'}`;
    
    await this.sendNotification({
      text,
      icon_emoji: ':white_check_mark:'
    });
  }

  async notifyAccountEdited(clientName: string, accountData: AccountData): Promise<void> {
    const text = `:pencil2: *Account Updated*\n\n*Agency:* ${clientName}\n*Username:* ${accountData.username}\n*Password:* ${accountData.password}\n*Page Type:* ${accountData.pageType} (${accountData.pageTypeStatus})\n*Base URL:* ${accountData.baseUrl}\n*Start Time:* ${accountData.startTime}\n*End Time:* ${accountData.endTime}\n*Language:* ${accountData.language}\n*Active Weekdays:* ${accountData.active_weekdays.join(', ')}\n*Notes:* ${accountData.notes || 'None'}\n*Proxy Host:* ${accountData.proxyHost || 'None'}\n*Proxy Port:* ${accountData.proxyPort || 'None'}\n*Proxy Username:* ${accountData.proxyUsername || 'None'}\n*Proxy Protocol:* ${accountData.proxyProtocol || 'None'}`;
    
    await this.sendNotification({
      text,
      icon_emoji: ':pencil2:'
    });
  }

  async notifyAccountDeleted(clientName: string, accountData: AccountData): Promise<void> {
    const text = `:wastebasket: *Account Deleted*\n\n*Agency:* ${clientName}\n*Username:* ${accountData.username}\n*Password:* ${accountData.password}\n*Page Type:* ${accountData.pageType} (${accountData.pageTypeStatus})\n*Base URL:* ${accountData.baseUrl}\n*Start Time:* ${accountData.startTime}\n*End Time:* ${accountData.endTime}\n*Language:* ${accountData.language}\n*Active Weekdays:* ${accountData.active_weekdays.join(', ')}\n*Notes:* ${accountData.notes || 'None'}\n*Proxy Host:* ${accountData.proxyHost || 'None'}\n*Proxy Port:* ${accountData.proxyPort || 'None'}\n*Proxy Username:* ${accountData.proxyUsername || 'None'}\n*Proxy Protocol:* ${accountData.proxyProtocol || 'None'}`;
    
    await this.sendNotification({
      text,
      icon_emoji: ':wastebasket:'
    });
  }

  async notifyIssueReported(clientName: string, username: string, pageType: string, pageTypeStatus: string, issueMessage: string): Promise<void> {
    const text = `:warning: *Issue Reported*\n\n*Agency:* ${clientName}\n*Username:* ${username}\n*Page Type:* ${pageType} (${pageTypeStatus})\n*Issue:* ${issueMessage}`;
    
    await this.sendNotification({
      text,
      icon_emoji: ':warning:'
    });
  }
}

const slackService = new SlackService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, clientName, username, pageType, pageTypeStatus, issueMessage, accountData } = body;

    if (!type || !clientName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'account_added':
        if (!accountData) {
          return NextResponse.json(
            { error: 'Account data is required for account added notifications' },
            { status: 400 }
          );
        }
        await slackService.notifyAccountAdded(clientName, accountData);
        break;
      case 'account_edited':
        if (!accountData) {
          return NextResponse.json(
            { error: 'Account data is required for account edited notifications' },
            { status: 400 }
          );
        }
        await slackService.notifyAccountEdited(clientName, accountData);
        break;
      case 'account_deleted':
        if (!accountData) {
          return NextResponse.json(
            { error: 'Account data is required for account deleted notifications' },
            { status: 400 }
          );
        }
        await slackService.notifyAccountDeleted(clientName, accountData);
        break;
      case 'issue_reported':
        if (!username || !pageType || !issueMessage) {
          return NextResponse.json(
            { error: 'Username, page type, and issue message are required for issue reports' },
            { status: 400 }
          );
        }
        await slackService.notifyIssueReported(clientName, username, pageType, pageTypeStatus || 'Unknown', issueMessage);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Slack notification API error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
