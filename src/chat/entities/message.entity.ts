import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';

@Table({ underscored: true })
export class Message extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  senderId: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  receiverId: string;

  @BelongsTo(() => User, 'senderId')
  sender: User;

  @BelongsTo(() => User, 'receiverId')
  receiver: User;

  @Column({ allowNull: false })
  content: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
