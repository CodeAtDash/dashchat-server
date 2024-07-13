import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../entities/user.entity';
import { removeUndefinedKeys } from 'src/utils/helpers';
import { InvalidUser } from 'src/utils/exceptions';
import { CreateUser } from '../types/create-user';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}
  async findOne({
    id,
    email,
    username,
    isVerified,
  }: {
    id?: string;
    email?: string;
    username?: string;
    isVerified?: boolean;
  }) {
    return this.userModel.findOne({
      where: removeUndefinedKeys({
        id,
        email,
        username,
        isVerified,
      }),
    });
  }

  async create({
    name,
    email,
    username,
    password,
    otp,
    verificationToken,
  }: CreateUser) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);

    return this.userModel.create({
      name,
      email,
      username,
      password: hash,
      isVerified: false,
      otp,
      verificationToken,
    });
  }

  async update(
    payload: {
      name?: string;
      password?: string;
      otp?: string | null;
      verificationToken?: string | null;
      isVerified?: boolean;
    },
    filters: {
      id?: string;
      email?: string;
      username?: string;
      otp?: string;
      verificationToken?: string;
      isVerified?: boolean;
    },
  ) {
    return this.userModel.update(payload, { where: filters });
  }

  async remove({ email, username }: { email?: string; username?: string }) {
    return this.userModel.destroy({
      where: removeUndefinedKeys({
        email,
        username,
      }),
    });
  }

  async verifyPassword({
    id,
    email,
    password,
  }: {
    id?: string;
    email?: string;
    password: string;
  }) {
    const user = await this.userModel.scope('withPassword').findOne({
      where: removeUndefinedKeys({
        id,
        email,
      }),
    });

    if (!user) {
      throw new InvalidUser();
    }

    return bcrypt.compare(password, user.password);
  }
}
