import { Controller, Get } from '@nestjs/common';
import { TagService } from './tag.service';
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  async getAll() {
    const allTags = this.tagService.getAll();
    const tags: string[] = (await allTags).map((tag) => tag.name);
    return { tags };
  }
}
