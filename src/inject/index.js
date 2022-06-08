window.unreadMessages = [];

function onFeedChange() {
  const feeds = document.querySelectorAll('.feedCard_item');
  const curUnread = new Set();
  feeds.forEach(node => {
    const badge = node.querySelector('.ud__badge.ud__badge-icon')
    if (!badge) {
      return;
    }
    const name = node.querySelector('p').innerText;
    const preview = node.querySelector('.feedMessagePreviewContent').innerText.split(': ', 1);
    const person = preview[0];
    const content = preview[1];
    console.log({ chat: name, person, content });
    curUnread.add({ chat: name, person, content });
  });

  const newMessages = [...curUnread].filter((x) => !unreadMessages.find(v => v.chat === x.chat && v.person === x.person && v.content === x.content));
  window.watcherWs.send(JSON.stringify(newMessages));
  newMessages.forEach(message => window.unreadMessages.push(message));
}

window.feedSection = document.querySelector('.lark_feedSection.lark_feedSection-inbox');

window.feedObserver = new MutationObserver(onFeedChange);
window.feedObserver.observe(window.feedSection, { childList: true, subtree: true });
window.watcherWs.onclose = window.feedObserver.disconnect;
window.watcherWs.onerror = window.feedObserver.disconnect;

