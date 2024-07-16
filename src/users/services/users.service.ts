import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../entities/user.entity';
import { isPresent, removeUndefinedKeys } from 'src/utils/helpers';
import { InvalidUser } from 'src/utils/exceptions';
import { PaginationDto } from '../dto/pagination.dto';
import { FindAndCountOptions } from 'sequelize';
import { Op } from 'sequelize';
import { RegistrationInitializeDto } from 'src/auth/dto/register.dto';

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

  async create({ name, email, username, password }: RegistrationInitializeDto) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);

    return this.userModel.create({
      name,
      email,
      username,
      password: hash,
      isVerified: false,
    });
  }

  async update(
    payload: {
      id?: string;
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
    return this.userModel.update(payload, { where: filters, returning: true });
  }

  async remove({ email, username }: { email?: string; username?: string }) {
    return this.userModel.destroy({
      where: removeUndefinedKeys({
        email,
        username,
      }),
    });
  }

  async verifyPassword({ id, password }: { id?: string; password: string }) {
    const user = await this.userModel.scope('withPassword').findOne({
      where: removeUndefinedKeys({
        id,
      }),
    });

    if (!user) {
      throw new InvalidUser();
    }

    return bcrypt.compare(password, user.password);
  }

  async getAllUsers(id: string, query: PaginationDto) {
    const { offset = 0, limit = 10, order = 'asc', search } = query;

    const options: FindAndCountOptions = {
      limit: limit,
      offset: offset,
      order: [['name', order.toUpperCase()]],
      where: {
        id: {
          [Op.ne]: id,
        },
      },
    };

    if (search) {
      options.where = {
        ...options.where,
        name: {
          [Op.iLike]: `%${search}%`,
        },
      };
    }

    const { rows, count } = await this.userModel.findAndCountAll(options);

    return {
      users: rows,
      total: count,
      offset: typeof offset === 'string' ? parseInt(offset) : offset,
      limit: typeof limit === 'string' ? parseInt(limit) : limit,
    };
  }

  async handleUser(user: {
    sub: string;
    email_verified: boolean;
    name: string;
    email: string;
  }) {
    const { sub, email_verified, name, email } = user;

    const userExists = await this.findOne({ email });
    if (isPresent(userExists)) {
      return userExists;
    }

    return this.userModel.create({
      name,
      email,
      username: sub,
      isVerified: email_verified,
    });
  }
}
