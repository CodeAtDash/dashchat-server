import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Group } from './group.entity';
import { User } from 'src/users/entities/user.entity';

@Table({ underscored: true })
export class GroupMessage extends Model {
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
  senderId: string;

  @BelongsTo(() => User)
  sender: User;

  @Column({ allowNull: false, type: DataType.TEXT })
  content: string;
}
