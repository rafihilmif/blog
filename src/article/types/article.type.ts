import { ArticleEntity } from '@/src/article/article.entity';

export type Article = Omit<ArticleEntity, 'updateTimeStamp'>;
