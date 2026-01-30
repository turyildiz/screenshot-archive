import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToR2, getPublicUrl } from '@/lib/r2';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};

    if (tag) {
      where.tags = { has: tag };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(endDate);
      }
    }

    const [screenshots, total] = await Promise.all([
      prisma.screenshot.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.screenshot.count({ where }),
    ]);

    return NextResponse.json({
      screenshots,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching screenshots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch screenshots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const tagsStr = formData.get('tags') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await uploadToR2(filename, buffer, file.type);

    const screenshot = await prisma.screenshot.create({
      data: {
        filename,
        originalName: file.name,
        url: getPublicUrl(filename),
        size: file.size,
        mimeType: file.type,
        tags,
      },
    });

    return NextResponse.json(screenshot, { status: 201 });
  } catch (error) {
    console.error('Error uploading screenshot:', error);
    return NextResponse.json(
      { error: 'Failed to upload screenshot' },
      { status: 500 }
    );
  }
}
