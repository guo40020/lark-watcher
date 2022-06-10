import puppeteer from 'puppeteer-core';
import ws from 'ws';
import fs from 'fs';

const injectScriptContent = fs.readFileSync('./dist/inject/index.js').toString();
const clientWs: ws.WebSocket[] = [];

const clientServer = new ws.WebSocketServer({ host: '127.0.0.1', port: 9871 });
clientServer.on('connection', (s) => {
  clientWs.push(s);
})

function broadcast(data: any) {
  clientWs.forEach((w) => {
    if (w.readyState === w.OPEN) {
      w.send(data);
    }
  })
}

const wsServer = new ws.WebSocketServer({ host: '127.0.0.1', port: 9870 });
wsServer.on('connection', (s) => {
  setTimeout(() => {
    s.send('connected');
  }, 1000);

  s.onmessage = (message) => {
    console.log(message.data);
    const parsed = JSON.parse(message.data.toString());
    if (parsed) {
      broadcast(message.data);
    }
  }
});


puppeteer.connect({
  browserURL: 'http://localhost:8315',
  defaultViewport: null,
}).then(async (v) => {
  const pages = await v.pages();
  await pages[0].evaluate('window.watcherWs = new WebSocket("ws://127.0.0.1:9870")');
  await pages[0].evaluate('window.watcherWs.onmessage = console.log');
  await pages[0].addScriptTag({ content: injectScriptContent });
});

