import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/utils/enums';
import { Group } from './group.entity';

@Table({ underscored: true })
export class GroupMembers extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Group)
  @Column({ type: DataType.UUID, allowNull: false })
  groupId: string;

  @BelongsTo(() => Group)
  group: Group;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.ENUM(Role.MEMBER, Role.ADMIN),
    allowNull: false,
    defaultValue: Role.MEMBER,
  })
  role: Role;
}
