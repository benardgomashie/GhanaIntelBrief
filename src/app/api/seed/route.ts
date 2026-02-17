'use server';

import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { articles as articleData, categories as categoryData, sources as sourceData } from '@/app/lib/seed-data';

export async function POST(request: NextRequest) {
  try {
    // Check if already seeded
    const articlesRef = adminFirestore.collection('articles');
    const existingArticles = await articlesRef.limit(1).get();
    
    if (!existingArticles.empty) {
      return NextResponse.json({ 
        message: 'Database already has articles',
        count: existingArticles.size 
      }, { status: 200 });
    }

    const batch = adminFirestore.batch();

    // Add Categories
    const categoryRefs: { name: string; id: string }[] = [];
    for (const category of categoryData) {
      const newDocRef = adminFirestore.collection('categories').doc();
      batch.set(newDocRef, { ...category, id: newDocRef.id, articleIds: [] });
      categoryRefs.push({ name: category.name, id: newDocRef.id });
    }

    // Add Sources
    const sourceRefs: { name: string; id: string }[] = [];
    for (const source of sourceData) {
      const newDocRef = adminFirestore.collection('sources').doc();
      batch.set(newDocRef, { ...source, id: newDocRef.id, articleIds: [] });
      sourceRefs.push({ name: source.name, id: newDocRef.id });
    }

    // Add Articles
    articleData.forEach((article, index) => {
      const articleRef = adminFirestore.collection('articles').doc();
      
      const assignedCategoryIds = [categoryRefs[index % categoryRefs.length].id];
      const assignedSourceIds = [sourceRefs[index % sourceRefs.length].id];

      batch.set(articleRef, {
        ...article,
        id: articleRef.id,
        aggregatedAt: new Date().toISOString(),
        categoryIds: assignedCategoryIds,
        sourceIds: assignedSourceIds,
      });
    });

    await batch.commit();

    return NextResponse.json({ 
      message: 'Database seeded successfully!',
      articles: articleData.length,
      categories: categoryData.length,
      sources: sourceData.length
    }, { status: 200 });

  } catch (error: any) {
    console.error('[SEED ERROR]', error);
    return NextResponse.json({ 
      error: 'Failed to seed database',
      details: error.message 
    }, { status: 500 });
  }
}
