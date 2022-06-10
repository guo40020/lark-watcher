window.unreadMessages = [];
var feedIdChatType: Record<string, ChatType> = {};

function onFeedChange() {
  const feeds = document.querySelectorAll('.feedCard_item');
  const curUnread = new Set<IChatMessage>();
  feeds.forEach(node => {
    const badge = node.querySelector('.ud__badge__badge.ud__badge-topRight');
    if (!badge) {
      return;
    }
    let muted = badge.classList.contains('ud__badge-neutral-filled');
    console.log(badge.classList.toString())
    const name = node.querySelector('p')!.innerText;
    const previewSpans = node.querySelector('.feedMessagePreviewContent')!.querySelectorAll('span');
    const mentions: string[] = [];
    let fromPerson: string | undefined = undefined;
    let content: string = '';

    previewSpans?.forEach(v => {
      if (v.innerText.startsWith('@')) {
        mentions.push(v.innerText.replace('@', ''));
      } else if (v.innerText.endsWith(': ')) {
        fromPerson = v.innerText.substring(0, v.innerText.length - 2);
      } else {
        content += v.innerText;
      }
    });

    const feedId = node.getAttribute('data-feed-id')!;
    if (!feedIdChatType[feedId] || feedIdChatType[feedId] === 'unknown') {
      const tag = node.querySelector('.ud__tag.ud__tag-xs.ud__tag-rect');
      if (tag) {
        if (tag.classList.contains('ud__tag-yellow')) {
          feedIdChatType[feedId] = 'bot';
        } else if (tag.classList.contains('ud__tag-blue')) {
          feedIdChatType[feedId] = 'group';
        }
      } else {
        feedIdChatType[feedId] = 'unknown';
      }
    }

    curUnread.add({ chat: name, content, person: fromPerson, muted, type: feedIdChatType[feedId] });
  });

  const newMessages = [...curUnread].filter((x) => !unreadMessages.find(v => v.chat === x.chat && v.person === x.person && v.content === x.content));
  window.watcherWs.send(JSON.stringify(newMessages));
  newMessages.forEach(message => window.unreadMessages.push(message));
}

function GrabMessages() {

}

var feedSection = document.querySelector('.lark_feedSection.lark_feedSection-inbox')!;

window.feedObserver = new MutationObserver(onFeedChange);
window.feedObserver.observe(feedSection, { childList: true, subtree: true });
window.watcherWs.onclose = window.feedObserver.disconnect;
window.watcherWs.onerror = window.feedObserver.disconnect;

