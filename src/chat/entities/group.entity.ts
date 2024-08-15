import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { GroupMembers } from './group-members.entity';

@Table({ underscored: true })
export class Group extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  description: string;

  @HasMany(() => GroupMembers)
  members: GroupMembers[];
}
