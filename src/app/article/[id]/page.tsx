import { permanentRedirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { adminFirestore } from '@/lib/firebase-admin';
import type { Article } from '@/app/lib/types';
import { slugify } from '@/lib/slugify';

/**
 * Permanent redirect from /article/[id] → /article/[id]/[slug]
 *
 * Handles bookmarks, old sitemap entries, and any external links that point
 * to the pre-slug URL format. Google will update its index via the 308.
 */
export default async function ArticleRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const articleDoc = await adminFirestore.collection('articles').doc(id).get();

  if (!articleDoc.exists) {
    notFound();
  }

  const article = articleDoc.data() as Article;
  const slug = article.slug || slugify(article.title);

  permanentRedirect(`/article/${id}/${slug}`);
}
