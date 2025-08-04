import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from '../article/article.entity';
import { UserModule } from '../user/user.module';
import { FollowEntity } from '../profile/follow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArticleEntity, FollowEntity]),
    UserModule,
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
