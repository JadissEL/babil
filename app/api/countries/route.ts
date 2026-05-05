import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      include: {
        comments: {
          where: { status: 'APPROVED' },
          include: { user: true }
        }
      }
    });

    const formatted = countries.map((c: any) => ({
      ...c,
      full_data: JSON.parse(c.full_data || '{}')
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
