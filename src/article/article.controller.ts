import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { User } from '@/src/user/decorators/user.decorator';
import { UserEntity } from '@/src/user/user.entity';
import { CreateArticleDto } from '@/src/article/dto/create-article-dto';
import { ArticleEntity } from '@/src/article/article.entity';
import { AuthGuard } from '@/src/user/guards/auth.guard';
import { IArticleResponse } from '@/src/article/types/articleResponse.interface';
import { UpdateArticleDto } from '@/src/article/dto/update-article-dto';
import { IArticlesResponse } from '@/src/article/types/articlesResponse';
import { waitForDebugger } from 'inspector';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard)
  async createArticle(
    @User() user: UserEntity,
    @Body('article') createArticleDto: CreateArticleDto,
  ): Promise<IArticleResponse> {
    const newArticle = await this.articleService.createArticle(
      user,
      createArticleDto,
    );
    return this.articleService.generateArticleResponse(newArticle);
  }

  @Get('feed')
  @UseGuards(AuthGuard)
  async getUserFeed(
    @User('id') currentUserId: number,
    @Query() q: any,
  ): Promise<IArticlesResponse> {
    return await this.articleService.getFeed(currentUserId, q);
  }

  @Get(':slug')
  async getArticle(@Param('slug') slug: string): Promise<IArticleResponse> {
    const article = await this.articleService.getSingleArticle(slug);

    return article;
  }
  @Delete(':slug')
  async deleteArticle(
    @Param('slug') slug: string,
    @User('id') currentUserId: number,
  ) {
    return await this.articleService.deleteArticle(slug, currentUserId);
  }

  @Put(':slug')
  @UseGuards(AuthGuard)
  async updateArticle(
    @Param('slug') slug: string,
    @User('id') currentUserId: number,
    @Body('article') updateArticleDto: UpdateArticleDto,
  ): Promise<IArticleResponse> {
    const updateArticle = await this.articleService.updateArticle(
      slug,
      currentUserId,
      updateArticleDto,
    );

    return this.articleService.generateArticleResponse(updateArticle);
  }

  @Get()
  async findAll(
    @User('id') currentUserId: number,
    @Query() query: any,
  ): Promise<IArticlesResponse> {
    return await this.articleService.findAll(currentUserId, query);
  }

  @Post(':slug/favorite')
  @UseGuards(AuthGuard)
  async addToFavoriteArticle(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ): Promise<IArticleResponse> {
    const favoriteArticle = await this.articleService.addToFavoriteArticle(
      currentUserId,
      slug,
    );
    return this.articleService.generateArticleResponse(favoriteArticle);
  }

  @Delete(':slug/favorite')
  @UseGuards(AuthGuard)
  async removeArticleFromFavorite(
    @User('id') currentUserId: number,
    @Param('slug') slug: string,
  ): Promise<IArticleResponse> {
    const removedArticle = await this.articleService.removeArticleFromFavorite(
      currentUserId,
      slug,
    );
    return this.articleService.generateArticleResponse(removedArticle);
  }
}
