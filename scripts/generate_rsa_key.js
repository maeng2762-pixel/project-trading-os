const crypto = require('crypto');

console.log('🔄 암호화폐 봇을 위한 RSA-2048 보안 키 생성 중...\n');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

console.log('====================================================');
console.log('                 ⭐️ 공개키 (Public Key) ⭐️              ');
console.log(' (바이낸스 API 생성 시 "자체 생성(Self-generated)"을 누르고 아래 키를 복사해 넣으세요)');
console.log('====================================================');
console.log(publicKey);

console.log('\n\n====================================================');
console.log('                 🔐 비밀키 (Private Key) 🔐             ');
console.log(' 이 값은 절대 타인에게 노출하면 안됩니다. Vercel(또는 .env.local)의');
console.log(' BINANCE_API_SECRET 값에 이 전체(BEGIN/END 포함)를 통째로 복사해서 넣으세요.');
console.log('====================================================');
console.log(privateKey);
