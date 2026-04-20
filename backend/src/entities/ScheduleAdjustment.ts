import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm"
import ScheduleCandidate from "./ScheduleCandidate"
import ScheduleResponse from "./ScheduleResponse"

@Entity({ name: "schedule_adjustment" })
export class ScheduleAdjustment extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ unique: true })
  linkId!: string

  @Column()
  title!: string

  @Column()
  organizerName!: string

  @Column({ nullable: true })
  description!: string | null

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date

  @OneToMany(() => ScheduleCandidate, (candidate) => candidate.adjustment)
  candidates!: Relation<ScheduleCandidate[]>

  @OneToMany(() => ScheduleResponse, (response) => response.adjustment)
  responses!: Relation<ScheduleResponse[]>
}

export default ScheduleAdjustment
