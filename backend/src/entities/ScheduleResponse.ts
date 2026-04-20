import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm"
import ScheduleAdjustment from "./ScheduleAdjustment"
import ScheduleResponseAnswer from "./ScheduleResponseAnswer"

@Entity({ name: "schedule_response" })
export class ScheduleResponse extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  adjustmentId!: string

  @Column()
  responderName!: string

  @Column({ nullable: true })
  comment!: string | null

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date

  @ManyToOne(() => ScheduleAdjustment, (adjustment) => adjustment.responses, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "adjustmentId" })
  adjustment!: Relation<ScheduleAdjustment>

  @OneToMany(() => ScheduleResponseAnswer, (answer) => answer.response)
  answers!: Relation<ScheduleResponseAnswer[]>
}

export default ScheduleResponse
