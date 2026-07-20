import { type MigrationInterface, type QueryRunner } from "typeorm"

export class AddSessionTable1784545709445 implements MigrationInterface {
    name = 'AddSessionTable1784545709445'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "session" (
            "sid" character varying NOT NULL COLLATE "default",
            "sess" json NOT NULL,
            "expire" timestamp(6) NOT NULL,
            CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
        )`)
        await queryRunner.query(`CREATE INDEX "IDX_session_expire" ON "session" ("expire")`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_session_expire"`)
        await queryRunner.query(`DROP TABLE "session"`)
    }
}
