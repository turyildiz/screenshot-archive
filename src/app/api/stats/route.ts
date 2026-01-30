import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'edge';

export async function GET() {
  try {
    const [total, byTag, byMonth] = await Promise.all([
      prisma.screenshot.count(),
      prisma.screenshot.findMany({
        select: { tags: true },
      }),
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as count
        FROM "Screenshot"
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
        LIMIT 12
      ` as Promise<{ month: Date; count: bigint }[]>,
    ]);

    const tagCounts: Record<string, number> = {};
    byTag.forEach(s => {
      s.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return NextResponse.json({
      total,
      byTag: Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count),
      byMonth: byMonth.map(m => ({
        month: m.month.toISOString(),
        count: Number(m.count),
      })),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
