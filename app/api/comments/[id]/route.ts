import { CommentStatus, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: userId as string }
  });

  if (user?.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { status?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const statusStr = typeof body.status === 'string' ? body.status : '';
  if (!statusStr || !Object.values(CommentStatus).includes(statusStr as CommentStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const commentId = Number.parseInt(params.id, 10);
  if (!Number.isFinite(commentId)) {
    return NextResponse.json({ error: 'Invalid comment id' }, { status: 400 });
  }

  try {
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { status: statusStr as CommentStatus }
    });
    return NextResponse.json(comment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: userId as string }
  });

  if (user?.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const commentId = Number.parseInt(params.id, 10);
  if (!Number.isFinite(commentId)) {
    return NextResponse.json({ error: 'Invalid comment id' }, { status: 400 });
  }

  try {
    await prisma.comment.delete({
      where: { id: commentId }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
