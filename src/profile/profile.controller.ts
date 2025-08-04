import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from '@/src/user/decorators/user.decorator';
import { AuthGuard } from '@/src/user/guards/auth.guard';
import { IProfileResponse } from '@/src/profile/types/profileResponse.interface';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  async getProfile(
    @User('id') currentUserId: number,
    @Param('username') profileUsername: string,
  ) {
    const profile = await this.profileService.getProfile(
      currentUserId,
      profileUsername,
    );
    return this.profileService.generateProfileResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(
    @User('id') currentUserId: number,
    @Param('username') followingUsername: string,
  ): Promise<IProfileResponse> {
    const newFollow = await this.profileService.followProfile(
      currentUserId,
      followingUsername,
    );

    return this.profileService.generateProfileResponse(newFollow);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unfollowProfile(
    @User('id') currentUserId: number,
    @Param('username') followingUsername: string,
  ): Promise<IProfileResponse> {
    const newUnfollow = await this.profileService.unfollowProfile(
      currentUserId,
      followingUsername,
    );

    return this.profileService.generateProfileResponse(newUnfollow);
  }
}
