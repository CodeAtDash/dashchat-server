import {
  AfterCreate,
  AfterDestroy,
  AfterUpdate,
  Column,
  CreatedAt,
  DataType,
  DefaultScope,
  HasMany,
  IsUUID,
  Model,
  PrimaryKey,
  Scopes,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { GroupMembers } from 'src/chat/entities/group-members.entity';
import { Message } from 'src/chat/entities/message.entity';

@DefaultScope(() => ({
  attributes: {
    exclude: ['password', 'otp', 'verificationToken'],
  },
}))
@Scopes(() => ({
  withPassword: {
    attributes: { include: ['password'] },
  },
  withPasswordResetFields: {
    attributes: { include: ['otp', 'verificationToken'] },
  },
}))
@Table({ underscored: true })
export class User extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id: string;

  @Column({ allowNull: false })
  name: string;

  @Column({ allowNull: false, unique: true })
  email: string;

  @Column({ allowNull: false, unique: true })
  username: string;

  @Column({ allowNull: true })
  password: string;

  @Column({ allowNull: false, defaultValue: false })
  isVerified: boolean;

  @Column
  otp: string;

  @Column(DataType.TEXT)
  verificationToken: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Message, 'senderId')
  sentMessages: Message[];

  @HasMany(() => Message, 'receiverId')
  receivedMessages: Message[];

  @HasMany(() => GroupMembers)
  groupMemberships: GroupMembers[];

  @AfterCreate
  @AfterUpdate
  @AfterDestroy
  static sanitize(instance: User) {
    delete instance['dataValues'].password;
    delete instance['dataValues'].otp;
    delete instance['dataValues'].verificationToken;
  }

  toJSON() {
    const attributes = super.toJSON();

    delete attributes.password;
    delete attributes.otp;
    delete attributes.verificationToken;

    return attributes;
  }
}
