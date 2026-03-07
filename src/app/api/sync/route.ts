import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    return NextResponse.json({ success: true, message: "Omni-Sync Route Operational" });
}

export async function GET() {
    return NextResponse.json({ status: "Omni-Sync Protocol Active" });
}
