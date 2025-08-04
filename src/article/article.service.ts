import { ArticleEntity } from '../article/article.entity';
import { UserEntity } from '../user/user.entity';
import { CreateArticleDto } from '@/src/article/dto/create-article-dto';
import { IArticleResponse } from '@/src/article/types/articleResponse.interface';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import slugify from 'slugify';
import { UpdateArticleDto } from '@/src/article/dto/update-article-dto';
import { IArticlesResponse } from '@/src/article/types/articlesResponse';
import { FollowEntity } from '../profile/follow.entity';
@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async findAll(currentUserId: number, query: any): Promise<IArticlesResponse> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        where: {
          username: query.author,
        },
      });

      if (author) {
        queryBuilder.andWhere('articles.authorId = :id', {
          id: author.id,
        });
      } else {
        return { articles: [], articlesCount: 0 };
      }
    }

    if (query.favorited) {
      const favoritedUser = await this.userRepository.findOne({
        where: {
          username: query.favorited,
        },
        relations: ['favorites'],
      });

      if (!favoritedUser || favoritedUser.favorites.length === 0) {
        return { articles: [], articlesCount: 0 };
      }

      const favoritesId = favoritedUser.favorites.map((article) => article.id);
      queryBuilder.andWhere('articles.id IN (:...ids)', { ids: favoritesId });
    }

    queryBuilder.orderBy('articles.created_at', 'DESC');

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const [articles, articlesCount] = await queryBuilder.getManyAndCount();

    let userFavoritesIds: number[] = [];

    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: {
          id: currentUserId,
        },
        relations: ['favorites'],
      });

      if (currentUser) {
        userFavoritesIds = currentUser
          ? currentUser.favorites.map((article) => article.id)
          : [];
      }
    }

    const articlesWithFavorited = articles.map((article) => {
      const favorited = userFavoritesIds.includes(article.id);
      return {
        ...article,
        favorited,
        updateTimestamp: article.updateTimestamp || (() => {}),
      };
    });
    return { articles: articlesWithFavorited, articlesCount };
  }

  async createArticle(
    user: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();

    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }

    // Javascript lesson -> javascript-lesson -> blog.com
    article.slug = this.generateSlug(article.title);
    article.author = user;

    return await this.articleRepository.save(article);
  }

  async getSingleArticle(slug: string): Promise<IArticleResponse> {
    const article = await this.findBySlug(slug);
    return { article };
  }

  async deleteArticle(
    slug: string,
    currentUserId: number,
  ): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);

    if (article.author.id !== currentUserId) {
      throw new HttpException(
        'Unauthorized, Wrong account!',
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.articleRepository.delete({ slug });
  }

  async updateArticle(
    slug: string,
    currentUserId: number,
    updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    if (article.author.id !== currentUserId) {
      throw new HttpException(
        'Unauthorized, Wrong account!',
        HttpStatus.FORBIDDEN,
      );
    }
    if (updateArticleDto.title) {
      article.slug = this.generateSlug(updateArticleDto.title);
    }

    Object.assign(article, updateArticleDto);
    return await this.articleRepository.save(article);
  }

  async addToFavoriteArticle(
    currentUserId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id: currentUserId,
      },
      relations: ['favorites'],
    });

    if (!user) {
      throw new HttpException(
        `User with ID ${currentUserId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const currentArticle = await this.findBySlug(slug);

    const isNotFavorite = !user.favorites.find(
      (article) => article.slug === currentArticle.slug,
    );

    if (isNotFavorite) {
      currentArticle.favoritesCount++;
      user.favorites.push(currentArticle);
      await this.articleRepository.save(currentArticle);
      await this.userRepository.save(user);
    } else {
      throw new HttpException(
        'Article is already in favorites',
        HttpStatus.BAD_REQUEST,
      );
    }

    return currentArticle;
  }

  async removeArticleFromFavorite(
    curretUserId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id: curretUserId,
      },
      relations: ['favorites'],
    });

    if (!user) {
      throw new HttpException(
        `User with ID ${curretUserId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const currentArticle = await this.findBySlug(slug);

    const articleIndex = user.favorites.findIndex(
      (article) => article.slug === currentArticle.slug,
    );

    if (articleIndex >= 0) {
      currentArticle.favoritesCount--;
      user.favorites.splice(articleIndex, 1);
      await this.articleRepository.save(currentArticle);
      await this.userRepository.save(user);
    } else {
      throw new HttpException(
        'Article is not in user favorites',
        HttpStatus.BAD_REQUEST,
      );
    }

    return currentArticle;
  }

  async getFeed(currentUserId: number, q: any): Promise<IArticlesResponse> {
    const follows = await this.followRepository.find({
      where: {
        followerId: currentUserId,
      },
    });

    const followingIds = follows.map((user) => user.followerId);

    if (!follows.length) {
      return { articles: [], articlesCount: 0 };
    }

    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.andWhere('articles.authorId IN (:...followingIds)', {
      followingIds,
    });

    const articles = await queryBuilder.getMany();
    const articlesCount = await queryBuilder.getCount();

    if (q.offset) {
      queryBuilder.offset(q.offset);
    }

    if (q.limit) {
      queryBuilder.limit(q.limit);
    }

    return { articles, articlesCount };
  }
  async findBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.articleRepository.findOne({
      where: {
        slug,
      },
    });

    if (!article) {
      throw new HttpException('Article is not found!', HttpStatus.NOT_FOUND);
    }
    return article;
  }

  generateArticleResponse(article: ArticleEntity): IArticleResponse {
    return {
      article,
    };
  }

  generateSlug(title: string): string {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    return `${slugify(title, { lower: true })}-${id}`;
  }
}
