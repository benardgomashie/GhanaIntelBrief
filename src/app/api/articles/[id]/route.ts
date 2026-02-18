'use server';

import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Simple authentication - you can enhance this
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`; // Reusing CRON_SECRET for simplicity
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the article
    await adminFirestore.collection('articles').doc(id).delete();
    
    console.log(`[ADMIN] Deleted article: ${id}`);
    
    return NextResponse.json({
      success: true,
      message: `Article ${id} deleted successfully`
    });
  } catch (error) {
    console.error('[ADMIN] Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article', details: (error as Error).message },
      { status: 500 }
    );
  }
}
