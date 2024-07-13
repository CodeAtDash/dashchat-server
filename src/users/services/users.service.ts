import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../entities/user.entity';
import { removeUndefinedKeys } from 'src/utils/helpers';
import { InvalidUser } from 'src/utils/exceptions';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}
  async findOne({
    id,
    email,
    isVerified,
  }: {
    id?: string;
    email?: string;
    isVerified?: boolean;
  }) {
    return this.userModel.findOne({
      where: removeUndefinedKeys({
        id,
        email,
        isVerified,
      }),
    });
  }

  async create({ name, email, password }: CreateUserDto) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);

    return this.userModel.create({
      name,
      email,
      password: hash,
      isVerified: false,
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
      otp?: string;
      verificationToken?: string;
      isVerified?: boolean;
    },
  ) {
    return this.userModel.update(payload, { where: filters });
  }

  async remove(id: string) {
    return this.userModel.destroy({
      where: { id },
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
