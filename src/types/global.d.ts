type ChatType = 'group' | 'person' | 'bot' | 'unknown';

interface IChatMessage {
  chat: string;
  person?: string;
  content: string;
  muted: boolean;
  type: ChatType;
  tags?: string[];
}

var unreadMessages: IChatMessage[];
var watcherWs: WebSocket;
var feedObserver: MutationObserver;

