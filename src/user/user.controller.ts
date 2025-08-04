import { AuthRequest } from '@/src/types/expressRequest.interface';
import { User } from '@/src/user/decorators/user.decorator';
import { CreateUserDto } from '@/src/user/dto/create-user.dto';
import { LoginUserDto } from '@/src/user/dto/login-user-dto';
import { UpdateUserDto } from '@/src/user/dto/update-user-dto';
import { AuthGuard } from '@/src/user/guards/auth.guard';
import { IUserResponse } from '@/src/user/types/userResponse.interface';
import { UserService } from '@/src/user/user.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  @UsePipes(new ValidationPipe())
  async createUser(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<IUserResponse> {
    return await this.userService.createUser(createUserDto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async loginUser(
    @Body('user') loginUserDto: LoginUserDto,
  ): Promise<IUserResponse> {
    const user = await this.userService.loginUser(loginUserDto);
    return this.userService.generateUserResponse(user);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  async updateUser(
    @User('id') userId: number,
    @Body('user') updateUserDto: UpdateUserDto,
  ): Promise<IUserResponse> {
    const updatedUser = await this.userService.updateUser(
      userId,
      updateUserDto,
    );

    return this.userService.generateUserResponse(updatedUser);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async getCurrentUser(@User() user): Promise<IUserResponse> {
    return await this.userService.generateUserResponse(user);
  }
}
