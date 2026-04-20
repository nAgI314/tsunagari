import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm"
import ScheduleAdjustment from "./ScheduleAdjustment"
import ScheduleResponseAnswer from "./ScheduleResponseAnswer"

@Entity({ name: "schedule_candidate" })
export class ScheduleCandidate extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  adjustmentId!: string

  @Column({ type: "timestamptz" })
  start!: Date

  @Column({ type: "timestamptz" })
  end!: Date

  @ManyToOne(() => ScheduleAdjustment, (adjustment) => adjustment.candidates, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "adjustmentId" })
  adjustment!: Relation<ScheduleAdjustment>

  @OneToMany(() => ScheduleResponseAnswer, (answer) => answer.candidate)
  answers!: Relation<ScheduleResponseAnswer[]>
}

export default ScheduleCandidate
