import { type MigrationInterface, type QueryRunner } from "typeorm"

export class AddScheduleSchema1776411860000 implements MigrationInterface {
  name = "AddScheduleSchema1776411860000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "schedule_adjustment" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "linkId" character varying NOT NULL,
        "title" character varying NOT NULL,
        "organizerName" character varying NOT NULL,
        "description" character varying,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_schedule_adjustment_linkId" UNIQUE ("linkId"),
        CONSTRAINT "PK_schedule_adjustment_id" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "schedule_candidate" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "adjustmentId" uuid NOT NULL,
        "start" TIMESTAMPTZ NOT NULL,
        "end" TIMESTAMPTZ NOT NULL,
        CONSTRAINT "PK_schedule_candidate_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_schedule_candidate_adjustment" FOREIGN KEY ("adjustmentId")
          REFERENCES "schedule_adjustment"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `)
    await queryRunner.query(
      `CREATE INDEX "IDX_schedule_candidate_adjustmentId" ON "schedule_candidate" ("adjustmentId")`,
    )

    await queryRunner.query(`
      CREATE TABLE "schedule_response" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "adjustmentId" uuid NOT NULL,
        "responderName" character varying NOT NULL,
        "comment" character varying,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_schedule_response_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_schedule_response_adjustment" FOREIGN KEY ("adjustmentId")
          REFERENCES "schedule_adjustment"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `)
    await queryRunner.query(
      `CREATE INDEX "IDX_schedule_response_adjustmentId" ON "schedule_response" ("adjustmentId")`,
    )

    await queryRunner.query(`
      CREATE TABLE "schedule_response_answer" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "responseId" uuid NOT NULL,
        "candidateId" uuid NOT NULL,
        "status" character varying(16) NOT NULL,
        CONSTRAINT "PK_schedule_response_answer_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_schedule_response_answer_response_candidate" UNIQUE ("responseId", "candidateId"),
        CONSTRAINT "CHK_schedule_response_answer_status" CHECK ("status" IN ('ok', 'maybe', 'ng')),
        CONSTRAINT "FK_schedule_response_answer_response" FOREIGN KEY ("responseId")
          REFERENCES "schedule_response"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_schedule_response_answer_candidate" FOREIGN KEY ("candidateId")
          REFERENCES "schedule_candidate"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `)
    await queryRunner.query(
      `CREATE INDEX "IDX_schedule_response_answer_responseId" ON "schedule_response_answer" ("responseId")`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_schedule_response_answer_candidateId" ON "schedule_response_answer" ("candidateId")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_schedule_response_answer_candidateId"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_schedule_response_answer_responseId"`)
    await queryRunner.query(`DROP TABLE "schedule_response_answer"`)

    await queryRunner.query(`DROP INDEX "public"."IDX_schedule_response_adjustmentId"`)
    await queryRunner.query(`DROP TABLE "schedule_response"`)

    await queryRunner.query(`DROP INDEX "public"."IDX_schedule_candidate_adjustmentId"`)
    await queryRunner.query(`DROP TABLE "schedule_candidate"`)

    await queryRunner.query(`DROP TABLE "schedule_adjustment"`)
  }
}
