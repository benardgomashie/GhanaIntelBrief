import {
  collection,
  doc,
  writeBatch,
  getDocs,
  Firestore,
} from 'firebase/firestore';
import { articles as articleData, categories as categoryData, sources as sourceData } from './seed-data';

export async function seedDatabase(db: Firestore) {
  const articlesCollection = collection(db, 'articles');
  const articlesSnapshot = await getDocs(articlesCollection);
  if (articlesSnapshot.docs.length > 0) {
    throw new Error("Database has already been seeded.");
  }

  const batch = writeBatch(db);

  // Add Categories and get their IDs
  const categoryRefs: { name: string; id: string }[] = [];
  for (const category of categoryData) {
    const newDocRef = doc(collection(db, 'categories'));
    batch.set(newDocRef, { ...category, id: newDocRef.id, articleIds: [] });
    categoryRefs.push({ name: category.name, id: newDocRef.id });
  }

  // Add Sources and get their IDs
  const sourceRefs: { name: string; id: string }[] = [];
  for (const source of sourceData) {
    const newDocRef = doc(collection(db, 'sources'));
    batch.set(newDocRef, { ...source, id: newDocRef.id, articleIds: [] });
    sourceRefs.push({ name: source.name, id: newDocRef.id });
  }

  // Add Articles
  articleData.forEach((article, index) => {
    const articleRef = doc(articlesCollection);
    
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
}
