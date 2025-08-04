import { CreateUserDto } from '@/src/user/dto/create-user.dto';
import { IUserResponse } from '@/src/user/types/userResponse.interface';
import { UserEntity } from '@/src/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign, verify } from 'jsonwebtoken';
import { LoginUserDto } from '@/src/user/dto/login-user-dto';
import { compare } from 'bcrypt';
import { UpdateUserDto } from '@/src/user/dto/update-user-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<IUserResponse> {
    const newUser = new UserEntity();
    Object.assign(newUser, createUserDto);

    const userByEmail = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    const userByUsername = await this.userRepository.findOne({
      where: {
        username: createUserDto.username,
      },
    });

    if (userByEmail || userByUsername) {
      throw new HttpException(
        'Email or username is already taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const savedUser = await this.userRepository.save(newUser);
    return this.generateUserResponse(savedUser);
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
    });

    if (!user) {
      throw new HttpException('Incorrect email!', HttpStatus.UNAUTHORIZED);
    }
    const matchPassword = await compare(loginUserDto.password, user.password);

    if (!matchPassword) {
      throw new HttpException('Incorrect password!', HttpStatus.UNAUTHORIZED);
    }

    delete user.password;
    return user;
  }

  async findById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new HttpException(
        `User with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.findById(userId);

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  generateToken(user: UserEntity): string {
    const generatedToken = sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.SECRET_TOKEN,
    );

    const decode = verify(generatedToken, process.env.SECRET_TOKEN);

    return generatedToken;
  }

  generateUserResponse(user: UserEntity): IUserResponse {
    return {
      user: { ...user, token: this.generateToken(user) },
    };
  }
}
