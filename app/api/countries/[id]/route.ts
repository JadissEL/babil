import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const country = await prisma.country.findUnique({
      where: { id },
      include: {
        comments: {
          where: { status: 'APPROVED' },
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!country) {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 });
    }

    const formattedCountry = {
      ...country,
      full_data: JSON.parse(country.full_data || '{}')
    };

    return NextResponse.json(formattedCountry);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
