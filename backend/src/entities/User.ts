import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ unique: true })
  googleId!: string

  @Column()
  email!: string

  @Column({ nullable: true })
  name!: string | null
}

export default User
