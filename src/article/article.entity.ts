import { UserEntity } from '../user/user.entity';
import {
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'articles' })
export class ArticleEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  slug: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: '' })
  body: string;

  @Column({ default: '' })
  title: string;

  @Column()
  authorId: number;

  @Column('simple-array')
  tagList: string[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @Column({ default: 0 })
  favoritesCount: number;

  @ManyToOne(() => UserEntity, (user) => user.articles, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;

  @BeforeUpdate()
  updateTimestamp() {
    this.updated_at = new Date();
  }
}
