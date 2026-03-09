import { GET } from '../src/app/api/cron/scan/route';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const req = new Request('http://localhost:3000/api/cron/scan', {
    headers: {
        authorization: `Bearer ${process.env.CRON_SECRET}`
    }
  });

  const res = await GET(req);
  console.log(await res.json());
}
run();
