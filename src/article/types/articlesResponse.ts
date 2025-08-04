import { Article } from '@/src/article/types/article.type';

export class IArticlesResponse {
  articles: Article[];
  articlesCount: number;
}
