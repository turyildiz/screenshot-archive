import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const screenshot = await prisma.screenshot.findUnique({
      where: { id },
    });

    if (!screenshot) {
      return NextResponse.json(
        { error: 'Screenshot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(screenshot);
  } catch (error) {
    console.error('Error fetching screenshot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch screenshot' },
      { status: 500 }
    );
  }
}
