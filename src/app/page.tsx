import { ArticleCard } from '@/components/article-card';
import { articles } from '@/app/lib/data';

export default function Home() {
  return (
    <>
      <h2 className="mb-8 text-3xl font-bold tracking-tight text-foreground font-headline md:text-4xl">
        Latest Briefings
      </h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </>
  );
}
