import { Table, Column, Model, DataType, Unique, AllowNull } from 'sequelize-typescript';

export interface ICreateUser {
  username: string;
  password: string; // This will store the hashed password
}

export interface IUser extends ICreateUser{
  id: number;
}

@Table({
  tableName: 'users', // Define the table name explicitly
  timestamps: false,   // createdAt and updatedAt columns
})
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  public id!: number;

  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING(255),
  })
  public username!: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(255), // Store hashed password
  })
  public password!: string; // This will store the hashed password
}