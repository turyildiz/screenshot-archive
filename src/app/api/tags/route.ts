import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const screenshots = await prisma.screenshot.findMany({
      select: { tags: true },
      distinct: ['tags'],
    });

    const allTags = new Set<string>();
    screenshots.forEach(s => s.tags.forEach(t => allTags.add(t)));

    return NextResponse.json(Array.from(allTags).sort());
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}
