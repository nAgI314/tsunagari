import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
} from "typeorm"
import ScheduleCandidate from "./ScheduleCandidate"
import ScheduleResponse from "./ScheduleResponse"

export type ResponseAnswerStatus = "ok" | "maybe" | "ng"

@Entity({ name: "schedule_response_answer" })
@Unique("UQ_schedule_response_answer_response_candidate", ["responseId", "candidateId"])
export class ScheduleResponseAnswer extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column()
  responseId!: string

  @Column()
  candidateId!: string

  @Column({ type: "varchar", length: 16 })
  status!: ResponseAnswerStatus

  @ManyToOne(() => ScheduleResponse, (response) => response.answers, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "responseId" })
  response!: Relation<ScheduleResponse>

  @ManyToOne(() => ScheduleCandidate, (candidate) => candidate.answers, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "candidateId" })
  candidate!: Relation<ScheduleCandidate>
}

export default ScheduleResponseAnswer
