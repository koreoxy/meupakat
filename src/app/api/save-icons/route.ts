import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { p192, p512, p512m } = await req.json();

    const iconsDir = path.join(process.cwd(), 'public', 'icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }

    if (p192) {
      const base64Data = p192.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), base64Data, 'base64');
    }
    if (p512) {
      const base64Data = p512.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), base64Data, 'base64');
    }
    if (p512m) {
      const base64Data = p512m.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(path.join(iconsDir, 'icon-512-maskable.png'), base64Data, 'base64');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
