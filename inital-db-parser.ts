import * as io from 'fs';
import * as Crypto from 'crypto';

let rawJSON = io.readFileSync('templerbot-chatDB-export.json').toString('utf-8');

console.log(rawJSON.length);

let obj = JSON.parse(rawJSON);

let out: any = {};
out.keys = {};
out.total = 0;

function transformTextToKey(text: string): string {
    let hash = Crypto.createHash('md5');
    hash.update(text);
    return hash.digest('hex');
}

let lastChat: string | null = null;
for (let rooms in obj) {
    let arr: Array<any> = obj[rooms]['chats'];

    for (let chat of arr) {
        if (!chat || !chat['sender'] || !chat['sender']['nickname'] || chat['sender']['nickname'] === 'TEMPLER_BOT' || chat['sender']['nickname'] === 'Templerbot') continue;
        
        out.total++;

        let lastText = lastChat;
        let text = chat['message'];

        lastChat = text;

        if (!lastText) continue;

        let textHash = transformTextToKey(text);
        let lastTextHash = transformTextToKey(lastText);

        let random: number = Crypto.randomBytes(2).readInt16LE(0); // 0 - 65535

        let lastChatKey = out.keys[lastTextHash];

        if (!lastChatKey) {
            out.keys[lastTextHash] = {
                'text': lastText,
                'connection': {}
            };
        }

        let newLastChatRefCount: number = (out.keys[lastTextHash].connection[textHash] || 0) + 1;
        out.keys[lastTextHash].connection[textHash] = newLastChatRefCount;

        let chatKey = out.keys.textHash;

        if (!chatKey) continue;

        let connectionKeys = Object.keys(chatKey.connection);
        if (connectionKeys.length < 1) continue;

        if (random < 20000) { // LEARN SOMETHING FROM AFTER TREE
            let targetKey = connectionKeys[Math.min(Math.floor(connectionKeys.length * Math.random()), connectionKeys.length - 1)];
            let targetChatKey = out.keys[targetKey];

            if (!targetChatKey) continue;

            let targetKeyConnectionKeys = Object.keys(targetChatKey.connection);
            let studyKey = targetKeyConnectionKeys[Math.min(Math.floor(targetKeyConnectionKeys.length * Math.random()), targetKeyConnectionKeys.length - 1)];

            let newStudyKeyRefCount = (out.keys.textHash.connection[studyKey] || 0) + 1;
            out.keys.textHash.connection[studyKey] = newStudyKeyRefCount;
        }
    }

    lastChat = null;
}

io.writeFileSync('gossip-db.json', JSON.stringify(out, null, '    '));