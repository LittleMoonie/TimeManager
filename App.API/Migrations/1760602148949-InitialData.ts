import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialData1760602148949 implements MigrationInterface {
  name = 'InitialData1760602148949';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "menu_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "key" character varying NOT NULL, "title" character varying NOT NULL, "icon" character varying, "sortOrder" integer NOT NULL DEFAULT '0', "companyId" uuid NOT NULL, CONSTRAINT "UQ_4ab8d484cb775626084fbb0d61a" UNIQUE ("key"), CONSTRAINT "PK_246dfbfa0f3b0a4e953f7490544" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4ab8d484cb775626084fbb0d61" ON "menu_category" ("key") `,
    );
    await queryRunner.query(
      `CREATE TABLE "menu_card" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "categoryKey" character varying NOT NULL, "title" character varying NOT NULL, "subtitle" character varying NOT NULL, "route" character varying NOT NULL, "icon" character varying, "requiredPermission" character varying, "featureFlag" character varying, "isEnabled" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT '0', "companyId" uuid NOT NULL, "categoryId" uuid, CONSTRAINT "PK_ddc34140035d9f9e6db7641c610" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "action_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "code" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "color" character varying(7) NOT NULL DEFAULT '#000000', "type" character varying(16) NOT NULL DEFAULT 'billable', "active" boolean NOT NULL DEFAULT true, "billableDefault" character varying(24) NOT NULL DEFAULT 'auto', "billableEditable" boolean NOT NULL DEFAULT false, "locationPolicy" character varying(32) NOT NULL DEFAULT 'any', CONSTRAINT "UQ_cadb5135dddc76482563e8fe377" UNIQUE ("companyId", "code"), CONSTRAINT "PK_c244221d97837341650b0b6ca60" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cadb5135dddc76482563e8fe37" ON "action_codes" ("companyId", "code") `,
    );
    await queryRunner.query(
      `CREATE TABLE "timesheet_rows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "userId" uuid NOT NULL, "timesheetId" uuid NOT NULL, "activityLabel" character varying(255) NOT NULL, "timeCodeId" uuid NOT NULL, "billable" character varying(24) NOT NULL DEFAULT 'auto', "location" character varying(32) NOT NULL DEFAULT 'Office', "employeeCountryCode" character varying(2), "countryCode" character varying(2) NOT NULL, "status" character varying(24) NOT NULL DEFAULT 'draft', "locked" boolean NOT NULL DEFAULT false, "sortOrder" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_cd278fc8f49250ae14d5af005e1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8b9e5da7fc2134b6406f3025ca" ON "timesheet_rows" ("userId", "timesheetId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_57dcdcc9b48eaafef8d663f1a7" ON "timesheet_rows" ("companyId", "timesheetId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "timesheets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "userId" uuid NOT NULL, "periodStart" date NOT NULL, "periodEnd" date NOT NULL, "status" character varying(16) NOT NULL DEFAULT 'DRAFT', "submittedAt" TIMESTAMP WITH TIME ZONE, "submittedByUserId" uuid, "approvedAt" TIMESTAMP WITH TIME ZONE, "approverId" uuid, "totalMinutes" integer NOT NULL DEFAULT '0', "notes" text, CONSTRAINT "PK_1dc280b68c9353ecce41a34be71" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3021b8f6838973d8ac4980c424" ON "timesheets" ("companyId", "status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_7d68b6b580dee2d278730e2523" ON "timesheets" ("companyId", "userId", "periodStart", "periodEnd") `,
    );
    await queryRunner.query(
      `CREATE TABLE "timesheet_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "userId" uuid NOT NULL, "timesheetId" uuid, "timesheetRowId" uuid, "actionCodeId" uuid NOT NULL, "workMode" character varying(8) NOT NULL DEFAULT 'office', "country" character varying(2) NOT NULL, "startedAt" TIMESTAMP WITH TIME ZONE, "endedAt" TIMESTAMP WITH TIME ZONE, "durationMin" integer NOT NULL, "day" date NOT NULL, "note" text, "status" character varying(32) NOT NULL DEFAULT 'saved', "statusUpdatedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "CHK_f43d68235bf6b726c53ed99559" CHECK ("durationMin" BETWEEN 0 AND 1440), CONSTRAINT "PK_25a8a9b6a96e72864d598563c56" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3f3da1c533bf1ff4ffdb5b5b12" ON "timesheet_entries" ("timesheetRowId", "day") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_37f742cd24094240abfefe7c73" ON "timesheet_entries" ("companyId", "timesheetId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_159d34ce6ffc2c05457cd13153" ON "timesheet_entries" ("companyId", "userId", "day") `,
    );
    await queryRunner.query(
      `CREATE TABLE "timesheet_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "userId" uuid NOT NULL, "targetType" character varying(32) NOT NULL, "targetId" uuid NOT NULL, "action" character varying(32) NOT NULL, "actorUserId" uuid, "reason" text, "diff" jsonb, "metadata" jsonb, "occurredAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c1b6dc9f3965a4f70f1b7cbe0fa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f4d20dc751e282273acfa47f57" ON "timesheet_history" ("companyId", "targetType", "targetId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6268d20a72e1b18dff32f35f45" ON "timesheet_history" ("companyId", "userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "company_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "timezone" text NOT NULL DEFAULT 'UTC', "workWeek" jsonb NOT NULL DEFAULT '{}', "holidayCalendar" text, "timesheetApproverPolicy" character varying(32) NOT NULL DEFAULT 'manager_of_user', "allowedEmailDomains" text array, "requireCompanyEmail" boolean NOT NULL DEFAULT false, "defaultCountryCode" character varying(2), "defaultLocation" character varying(32) NOT NULL DEFAULT 'Office', "officeCountryCodes" text array, "maxWeeklyMinutes" integer NOT NULL DEFAULT '2400', CONSTRAINT "PK_04113fd28ea1da8e223c6fb83d6" PRIMARY KEY ("id", "companyId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "team_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "teamId" uuid NOT NULL, "userId" uuid NOT NULL, "role" character varying(50) NOT NULL DEFAULT 'member', CONSTRAINT "PK_ca3eae89dcf20c9fd95bf7460aa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c6f2f91de84d85084a930657f1" ON "team_members" ("companyId", "teamId", "userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "teams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "PK_7e5523774a38b08a6236d322403" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_966722747d5714ca0004d10881" ON "teams" ("companyId", "id", "name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "name" character varying(255) NOT NULL, "timezone" character varying(255), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3dacbb3eb4f095e29372ff8e13" ON "companies" ("name") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_d4bc3e82a314fa9e29f652c2c2" ON "companies" ("id") `);
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "name" character varying(100) NOT NULL, "description" text, CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_45a18190352130763a12277cf6" ON "permissions" ("companyId", "name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f41f8c6c1fb5eb042d2b37a45e" ON "permissions" ("companyId", "id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "roleId" uuid NOT NULL, "permissionId" uuid NOT NULL, CONSTRAINT "PK_84059017c90bfcb701b8fa42297" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4d5b34779ce0ce383408376696" ON "role_permissions" ("companyId", "roleId", "permissionId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "name" character varying(50) NOT NULL, "description" text, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0385fdf771296e383c90c8a201" ON "roles" ("companyId", "name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e49da5b4edf713f75a9cedbe67" ON "roles" ("companyId", "id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "active_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "userId" uuid NOT NULL, "tokenHash" text NOT NULL, "previousTokenHash" text, "expiresAt" TIMESTAMP WITH TIME ZONE, "revokedAt" TIMESTAMP WITH TIME ZONE, "lastSeenAt" TIMESTAMP WITH TIME ZONE, "ip" inet, "userAgent" text, "deviceId" text, CONSTRAINT "PK_8adff44cf2b22fd7ac602019bf6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9552793858873524524e6292dc" ON "active_sessions" ("expiresAt") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8a0232c472ac5fd98bc66dcfb2" ON "active_sessions" ("tokenHash") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_428eacd8106a365cb6d504fc1f" ON "active_sessions" ("companyId", "userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "email" citext NOT NULL, "firstName" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "passwordHash" character varying(255) NOT NULL, "mustChangePasswordAtNextLogin" boolean NOT NULL DEFAULT false, "roleId" uuid NOT NULL, "phoneNumber" character varying(32), "lastLogin" TIMESTAMP WITH TIME ZONE, "isAnonymized" boolean NOT NULL DEFAULT false, "statusId" uuid NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfef67e9afa18541460e965129" ON "users" ("companyId", "statusId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d026fb529267ddb23a759d7812" ON "users" ("companyId", "roleId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_712444039e93513628513fa89a" ON "users" ("companyId", "email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3792ba7ce3ee793cf55d3a308a" ON "users" ("companyId", "id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_statuses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "code" character varying(50) NOT NULL, "name" character varying(50) NOT NULL, "description" text, "canLogin" boolean NOT NULL DEFAULT true, "isTerminal" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_cf4a8b23eb9b96fbde4d63ab8ce" UNIQUE ("code"), CONSTRAINT "UQ_cd345b985cb413bab7ef2cbb3f0" UNIQUE ("name"), CONSTRAINT "PK_50cc8fb0f4810b2f3bfcef7a788" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "timesheet_approvals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "timesheetId" uuid NOT NULL, "approverId" uuid NOT NULL, "status" character varying(16) NOT NULL DEFAULT 'PENDING', "reason" text, "decidedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_84be9f8cdb5c65c909e81574dd7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_6d24653c9636862b5c373045ff" ON "timesheet_approvals" ("companyId", "timesheetId", "approverId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "leave_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "userId" uuid NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "leaveType" character varying(20) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'PENDING', "reason" text, "rejectionReason" text, CONSTRAINT "PK_d3abcf9a16cef1450129e06fa9f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6cb7b102ce47a2a7062a0d2ae5" ON "leave_requests" ("companyId", "startDate", "endDate") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_694ca8851e4e80bdd0a50020c7" ON "leave_requests" ("companyId", "userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "webhook_outbox" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "eventType" character varying(64) NOT NULL, "payload" jsonb NOT NULL, "status" character varying(16) NOT NULL DEFAULT 'PENDING', "attempt" integer NOT NULL DEFAULT '0', "nextAttemptAt" TIMESTAMP WITH TIME ZONE, "lastError" text, CONSTRAINT "PK_f4a40df90155b6146edea062e4b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3a34232c2b64dc298cf17c49d5" ON "webhook_outbox" ("companyId", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b8b6bdf231541606d3b59f3bcb" ON "webhook_outbox" ("companyId", "eventType") `,
    );
    await queryRunner.query(
      `CREATE TABLE "webhook_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "type" character varying(16) NOT NULL, "event" text NOT NULL, "payload" jsonb, "response" jsonb, "statusCode" integer, "url" text, "error" text, CONSTRAINT "PK_c41f6cdf59cdfe3704807650896" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4eb5860e3d2a3e90cc7241a76f" ON "webhook_logs" ("companyId", "event") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c7a67fa4e2e06c363bf26b9b09" ON "webhook_logs" ("companyId", "type") `,
    );
    await queryRunner.query(
      `CREATE TABLE "webhook_deliveries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "outboxId" uuid NOT NULL, "url" text NOT NULL, "method" text NOT NULL, "statusCode" integer NOT NULL, "requestHeaders" jsonb, "responseHeaders" jsonb, "responseBody" text, "durationMs" integer, CONSTRAINT "PK_535dd409947fb6d8fc6dfc0112a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_83f1da2c400ac70f676657ee01" ON "webhook_deliveries" ("outboxId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_activity_logs_activitytype_enum" AS ENUM('CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'CHANGE_USER_STATUS', 'CREATE_ROLE', 'UPDATE_ROLE', 'DELETE_ROLE', 'ADD_PERMISSION_TO_ROLE', 'REMOVE_PERMISSION_FROM_ROLE', 'CREATE_PERMISSION', 'UPDATE_PERMISSION', 'DELETE_PERMISSION')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_activity_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "userId" uuid NOT NULL, "activityType" "public"."user_activity_logs_activitytype_enum" NOT NULL, "targetId" uuid, "details" jsonb, CONSTRAINT "PK_8cba6ba151a9dda40181f99386a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9d7893a95ffdd37a8984e40f18" ON "user_activity_logs" ("companyId", "targetId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3e6758ddae91d59f7f0c5d3d3e" ON "user_activity_logs" ("companyId", "activityType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_84f96322fea232b8f586b46a8a" ON "user_activity_logs" ("companyId", "userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "system_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "level" character varying(16) NOT NULL, "message" text NOT NULL, "metadata" jsonb, CONSTRAINT "PK_56861c4b9d16aa90259f4ce0a2c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f891ebd989b503abac3f670c35" ON "system_logs" ("companyId", "level") `,
    );
    await queryRunner.query(
      `CREATE TABLE "security_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "eventType" character varying(48) NOT NULL, "actorUserId" uuid, "subjectType" character varying(48) NOT NULL, "subjectId" uuid NOT NULL, "details" jsonb, "ip" inet, "userAgent" text, CONSTRAINT "PK_6fc100d6700780737348df0d3ae" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d4a8ef94b1bcea81a569a74e68" ON "security_events" ("companyId", "subjectType", "subjectId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_88a0c2638a01c6dc0bfed67709" ON "security_events" ("companyId", "eventType") `,
    );
    await queryRunner.query(
      `CREATE TABLE "login_attempts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "email" citext NOT NULL, "userId" uuid, "succeeded" boolean NOT NULL DEFAULT false, "reason" character varying(32), "ip" inet, "userAgent" text, "occurredAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_070e613c8f768b1a70742705c5b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1fd4bb40f33b2bc06104d0ee3c" ON "login_attempts" ("companyId", "userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2be1809111f92ac1364fa5b251" ON "login_attempts" ("companyId", "email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "email_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid, "toEmail" citext NOT NULL, "toName" text, "template" character varying(64) NOT NULL, "templateData" jsonb, "status" character varying(16) NOT NULL DEFAULT 'QUEUED', "providerMessageId" text, "error" text, "sentAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_999382218924e953a790d340571" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a97590f8e08c9b3f0139261f4f" ON "email_logs" ("companyId", "toEmail") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5f790cb75d98ba8bb0c58468da" ON "email_logs" ("companyId", "template") `,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "userId" uuid, "action" character varying(32) NOT NULL, "ip" inet, "userAgent" text, "metadata" jsonb, CONSTRAINT "PK_f4ee581a4a56f10b64ffbfc1779" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_22de6e14c6acf071b0f5b209af" ON "auth_logs" ("companyId", "action") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_658d43fbf41939f685cd83600c" ON "auth_logs" ("companyId", "userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "error_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "userId" uuid, "level" character varying(16) NOT NULL, "message" text NOT NULL, "stack" text, "metadata" jsonb, CONSTRAINT "PK_6840885d7eb78406fa7d358be72" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_54c55b1aaf304e61fcc4aafefe" ON "error_logs" ("companyId", "userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_33177b54ebfc0ad70dbd3cece2" ON "error_logs" ("companyId", "level") `,
    );
    await queryRunner.query(
      `CREATE TABLE "app_errors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid, "level" character varying(16) NOT NULL DEFAULT 'ERROR', "service" character varying(64) NOT NULL, "code" character varying(128), "message" text NOT NULL, "stack" text, "context" jsonb, CONSTRAINT "PK_e30e9102d1e2b791eec34ee3191" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a117d81764b6d868b979539619" ON "app_errors" ("companyId", "service") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3341e2af04b667e582bf2d8f2d" ON "app_errors" ("companyId", "level") `,
    );
    await queryRunner.query(
      `CREATE TABLE "data_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "userId" uuid, "action" character varying(32) NOT NULL, "entityType" text NOT NULL, "entityId" uuid NOT NULL, "oldValue" jsonb, "newValue" jsonb, "description" text, CONSTRAINT "PK_aec147a7e003a34933f70bc2596" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_21dd7cf480b28bd2ebe231037f" ON "data_logs" ("companyId", "entityType", "entityId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_34b3fbcb0fb110f4b3e6f0a6ea" ON "data_logs" ("companyId", "userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "data_access_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "actorUserId" uuid, "targetType" character varying(64) NOT NULL, "targetId" uuid NOT NULL, "purpose" text, "ip" inet, "userAgent" text, CONSTRAINT "PK_887a3d112356cce5f7e918d9a09" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_933a6512c88fd1ff683970f4c9" ON "data_access_logs" ("companyId", "actorUserId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2734a95ab9b9284d289be6a32e" ON "data_access_logs" ("companyId", "targetType", "targetId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "actorUserId" uuid, "entity" character varying(64) NOT NULL, "entityId" uuid NOT NULL, "action" character varying(32) NOT NULL, "diff" jsonb, "metadata" jsonb, "requestId" text, "ip" inet, "userAgent" text, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e5ce1d3dc21c4ca52b8ceb5c06" ON "audit_logs" ("companyId", "actorUserId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1213ae71840eb542af204cb52a" ON "audit_logs" ("companyId", "entity", "entityId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_efa597fecfef3d3ec683d69332" ON "audit_logs" ("companyId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "action_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "version" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdByUserId" uuid, "updatedByUserId" uuid, "companyId" uuid NOT NULL, "userId" uuid, "actionType" character varying(32) NOT NULL, "description" text NOT NULL, "metadata" jsonb, CONSTRAINT "PK_cc15d2a348eaf2e1e153055380c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_65046d2ba0bad86a52e9884557" ON "action_logs" ("companyId", "actionType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b404e6e95fdf5bb3b9b9883ffb" ON "action_logs" ("companyId", "userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_category" ADD CONSTRAINT "FK_039f21d131c30add6e477fe3f4c" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_card" ADD CONSTRAINT "FK_0cf865d0cb223e8dd59ed782529" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_card" ADD CONSTRAINT "FK_35892983cb51c14c99f3507b490" FOREIGN KEY ("categoryId") REFERENCES "menu_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_codes" ADD CONSTRAINT "FK_17c0a062a623025d6b70dd81226" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_rows" ADD CONSTRAINT "FK_fd6760d56ff38e9ef6f9cd37700" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_rows" ADD CONSTRAINT "FK_8683737f56c0f6809c0d322a3df" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_rows" ADD CONSTRAINT "FK_4a9907ebf895be0228ee29ce052" FOREIGN KEY ("timesheetId") REFERENCES "timesheets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_rows" ADD CONSTRAINT "FK_242ea60682a18efdef2fb90373a" FOREIGN KEY ("timeCodeId") REFERENCES "action_codes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheets" ADD CONSTRAINT "FK_89ac120b168dd4b26d4349554ff" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheets" ADD CONSTRAINT "FK_febd9f329a975672fa9a1f4448a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_entries" ADD CONSTRAINT "FK_380c5643e8a62add169346f1248" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_entries" ADD CONSTRAINT "FK_013f4b223291c19dd0cfbe8b486" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_entries" ADD CONSTRAINT "FK_2d6af47ea3d0f717cbd72aaf83c" FOREIGN KEY ("timesheetId") REFERENCES "timesheets"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_entries" ADD CONSTRAINT "FK_2fcd37fedc8e13cffc8555ee4d5" FOREIGN KEY ("timesheetRowId") REFERENCES "timesheet_rows"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_entries" ADD CONSTRAINT "FK_9f9e9227c677ff05786dbde0902" FOREIGN KEY ("actionCodeId") REFERENCES "action_codes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_history" ADD CONSTRAINT "FK_ca26a76210c39184513b8407acc" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_settings" ADD CONSTRAINT "FK_474a36aafd4ff4a422eab6a3a9d" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ADD CONSTRAINT "FK_a191cce2bbe49e41474666a9b19" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ADD CONSTRAINT "FK_6d1c8c7f705803f0711336a5c33" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" ADD CONSTRAINT "FK_0a72b849753a046462b4c5a8ec2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" ADD CONSTRAINT "FK_fc2a980dcd97019349b17b3921e" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "FK_e888ff0ee7bd00c3771a9efe360" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_213a7c67a32942a93a1f945a412" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_014b2fcda5716d8c15e80fd49ee" FOREIGN KEY ("roleId", "companyId") REFERENCES "roles"("id","companyId") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_c7769bcf3bbc2f66e4a37a821c3" FOREIGN KEY ("permissionId", "companyId") REFERENCES "permissions"("id","companyId") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_5ff67a53e3777f7ab6186db44ba" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "active_sessions" ADD CONSTRAINT "FK_5629b436a4b1ff80ef886aaaead" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "active_sessions" ADD CONSTRAINT "FK_be166928edf8fd4aa5281078f13" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_6f9395c9037632a31107c8a9e58" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_d026fb529267ddb23a759d78129" FOREIGN KEY ("roleId", "companyId") REFERENCES "roles"("id","companyId") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_fffa7945e50138103659f6326b7" FOREIGN KEY ("statusId") REFERENCES "user_statuses"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_approvals" ADD CONSTRAINT "FK_6b3b90451dd4c7f77171fe70ade" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_approvals" ADD CONSTRAINT "FK_67b89eba823d219dbc3d68b133f" FOREIGN KEY ("timesheetId") REFERENCES "timesheets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_approvals" ADD CONSTRAINT "FK_d91d706b145d7d465076fda498f" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_376c8ef3cabe68437bc0de9cf33" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_0cd010879e155a6611f00dc456e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_outbox" ADD CONSTRAINT "FK_e8f08024c92c93711ac323647de" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_logs" ADD CONSTRAINT "FK_d4d957bccdf2479c89ff8e0efa0" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "FK_83f1da2c400ac70f676657ee01d" FOREIGN KEY ("outboxId") REFERENCES "webhook_outbox"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_activity_logs" ADD CONSTRAINT "FK_6392c5d14e7a70a7f41a282b0d3" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_activity_logs" ADD CONSTRAINT "FK_348e9272a0e84920c9d3d52ffd8" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_logs" ADD CONSTRAINT "FK_645cf4a374c39d514de3408c4cd" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "security_events" ADD CONSTRAINT "FK_e0c789ed7790c076ae5e6c4607c" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "security_events" ADD CONSTRAINT "FK_6df120f11ca99d43c2e1640bb39" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_logs" ADD CONSTRAINT "FK_8d6bffc0a2a6c6c0272f93ebe47" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_logs" ADD CONSTRAINT "FK_564498ad3b1e8e338de48222381" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "error_logs" ADD CONSTRAINT "FK_97dc05895caf6aa993d5590b439" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "error_logs" ADD CONSTRAINT "FK_93172909565ba6cf0d3d8314dff" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_logs" ADD CONSTRAINT "FK_bbe480248bee00fad69af4c19ea" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_logs" ADD CONSTRAINT "FK_06f2c126041ecc55d3d085bb8be" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_access_logs" ADD CONSTRAINT "FK_e78343ba16619f728e192dcfb17" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_access_logs" ADD CONSTRAINT "FK_40d2592cf4943d6d0ac944e6ba6" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_efa597fecfef3d3ec683d693324" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_e36d23e1e7cf81ea77758bef795" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_logs" ADD CONSTRAINT "FK_89921ef56ca1d237cf174333cf2" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_logs" ADD CONSTRAINT "FK_de319bbd28a51b275eb155b1302" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "action_logs" DROP CONSTRAINT "FK_de319bbd28a51b275eb155b1302"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_logs" DROP CONSTRAINT "FK_89921ef56ca1d237cf174333cf2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_e36d23e1e7cf81ea77758bef795"`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_efa597fecfef3d3ec683d693324"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_access_logs" DROP CONSTRAINT "FK_40d2592cf4943d6d0ac944e6ba6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_access_logs" DROP CONSTRAINT "FK_e78343ba16619f728e192dcfb17"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_logs" DROP CONSTRAINT "FK_06f2c126041ecc55d3d085bb8be"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_logs" DROP CONSTRAINT "FK_bbe480248bee00fad69af4c19ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "error_logs" DROP CONSTRAINT "FK_93172909565ba6cf0d3d8314dff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "error_logs" DROP CONSTRAINT "FK_97dc05895caf6aa993d5590b439"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_logs" DROP CONSTRAINT "FK_564498ad3b1e8e338de48222381"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_logs" DROP CONSTRAINT "FK_8d6bffc0a2a6c6c0272f93ebe47"`,
    );
    await queryRunner.query(
      `ALTER TABLE "security_events" DROP CONSTRAINT "FK_6df120f11ca99d43c2e1640bb39"`,
    );
    await queryRunner.query(
      `ALTER TABLE "security_events" DROP CONSTRAINT "FK_e0c789ed7790c076ae5e6c4607c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_logs" DROP CONSTRAINT "FK_645cf4a374c39d514de3408c4cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_activity_logs" DROP CONSTRAINT "FK_348e9272a0e84920c9d3d52ffd8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_activity_logs" DROP CONSTRAINT "FK_6392c5d14e7a70a7f41a282b0d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_deliveries" DROP CONSTRAINT "FK_83f1da2c400ac70f676657ee01d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_logs" DROP CONSTRAINT "FK_d4d957bccdf2479c89ff8e0efa0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "webhook_outbox" DROP CONSTRAINT "FK_e8f08024c92c93711ac323647de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" DROP CONSTRAINT "FK_0cd010879e155a6611f00dc456e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" DROP CONSTRAINT "FK_376c8ef3cabe68437bc0de9cf33"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_approvals" DROP CONSTRAINT "FK_d91d706b145d7d465076fda498f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_approvals" DROP CONSTRAINT "FK_67b89eba823d219dbc3d68b133f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_approvals" DROP CONSTRAINT "FK_6b3b90451dd4c7f77171fe70ade"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_fffa7945e50138103659f6326b7"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_d026fb529267ddb23a759d78129"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_6f9395c9037632a31107c8a9e58"`);
    await queryRunner.query(
      `ALTER TABLE "active_sessions" DROP CONSTRAINT "FK_be166928edf8fd4aa5281078f13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "active_sessions" DROP CONSTRAINT "FK_5629b436a4b1ff80ef886aaaead"`,
    );
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_5ff67a53e3777f7ab6186db44ba"`);
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_c7769bcf3bbc2f66e4a37a821c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_014b2fcda5716d8c15e80fd49ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_213a7c67a32942a93a1f945a412"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "FK_e888ff0ee7bd00c3771a9efe360"`,
    );
    await queryRunner.query(`ALTER TABLE "teams" DROP CONSTRAINT "FK_fc2a980dcd97019349b17b3921e"`);
    await queryRunner.query(
      `ALTER TABLE "team_members" DROP CONSTRAINT "FK_0a72b849753a046462b4c5a8ec2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" DROP CONSTRAINT "FK_6d1c8c7f705803f0711336a5c33"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" DROP CONSTRAINT "FK_a191cce2bbe49e41474666a9b19"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_settings" DROP CONSTRAINT "FK_474a36aafd4ff4a422eab6a3a9d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_history" DROP CONSTRAINT "FK_ca26a76210c39184513b8407acc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_entries" DROP CONSTRAINT "FK_9f9e9227c677ff05786dbde0902"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_entries" DROP CONSTRAINT "FK_2fcd37fedc8e13cffc8555ee4d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_entries" DROP CONSTRAINT "FK_2d6af47ea3d0f717cbd72aaf83c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_entries" DROP CONSTRAINT "FK_013f4b223291c19dd0cfbe8b486"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_entries" DROP CONSTRAINT "FK_380c5643e8a62add169346f1248"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheets" DROP CONSTRAINT "FK_febd9f329a975672fa9a1f4448a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheets" DROP CONSTRAINT "FK_89ac120b168dd4b26d4349554ff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_rows" DROP CONSTRAINT "FK_242ea60682a18efdef2fb90373a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_rows" DROP CONSTRAINT "FK_4a9907ebf895be0228ee29ce052"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_rows" DROP CONSTRAINT "FK_8683737f56c0f6809c0d322a3df"`,
    );
    await queryRunner.query(
      `ALTER TABLE "timesheet_rows" DROP CONSTRAINT "FK_fd6760d56ff38e9ef6f9cd37700"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_codes" DROP CONSTRAINT "FK_17c0a062a623025d6b70dd81226"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_card" DROP CONSTRAINT "FK_35892983cb51c14c99f3507b490"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_card" DROP CONSTRAINT "FK_0cf865d0cb223e8dd59ed782529"`,
    );
    await queryRunner.query(
      `ALTER TABLE "menu_category" DROP CONSTRAINT "FK_039f21d131c30add6e477fe3f4c"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_b404e6e95fdf5bb3b9b9883ffb"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_65046d2ba0bad86a52e9884557"`);
    await queryRunner.query(`DROP TABLE "action_logs"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_efa597fecfef3d3ec683d69332"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1213ae71840eb542af204cb52a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e5ce1d3dc21c4ca52b8ceb5c06"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2734a95ab9b9284d289be6a32e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_933a6512c88fd1ff683970f4c9"`);
    await queryRunner.query(`DROP TABLE "data_access_logs"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_34b3fbcb0fb110f4b3e6f0a6ea"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_21dd7cf480b28bd2ebe231037f"`);
    await queryRunner.query(`DROP TABLE "data_logs"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3341e2af04b667e582bf2d8f2d"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a117d81764b6d868b979539619"`);
    await queryRunner.query(`DROP TABLE "app_errors"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_33177b54ebfc0ad70dbd3cece2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_54c55b1aaf304e61fcc4aafefe"`);
    await queryRunner.query(`DROP TABLE "error_logs"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_658d43fbf41939f685cd83600c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_22de6e14c6acf071b0f5b209af"`);
    await queryRunner.query(`DROP TABLE "auth_logs"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5f790cb75d98ba8bb0c58468da"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a97590f8e08c9b3f0139261f4f"`);
    await queryRunner.query(`DROP TABLE "email_logs"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2be1809111f92ac1364fa5b251"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1fd4bb40f33b2bc06104d0ee3c"`);
    await queryRunner.query(`DROP TABLE "login_attempts"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_88a0c2638a01c6dc0bfed67709"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d4a8ef94b1bcea81a569a74e68"`);
    await queryRunner.query(`DROP TABLE "security_events"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f891ebd989b503abac3f670c35"`);
    await queryRunner.query(`DROP TABLE "system_logs"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_84f96322fea232b8f586b46a8a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3e6758ddae91d59f7f0c5d3d3e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9d7893a95ffdd37a8984e40f18"`);
    await queryRunner.query(`DROP TABLE "user_activity_logs"`);
    await queryRunner.query(`DROP TYPE "public"."user_activity_logs_activitytype_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_83f1da2c400ac70f676657ee01"`);
    await queryRunner.query(`DROP TABLE "webhook_deliveries"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c7a67fa4e2e06c363bf26b9b09"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4eb5860e3d2a3e90cc7241a76f"`);
    await queryRunner.query(`DROP TABLE "webhook_logs"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b8b6bdf231541606d3b59f3bcb"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3a34232c2b64dc298cf17c49d5"`);
    await queryRunner.query(`DROP TABLE "webhook_outbox"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_694ca8851e4e80bdd0a50020c7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6cb7b102ce47a2a7062a0d2ae5"`);
    await queryRunner.query(`DROP TABLE "leave_requests"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6d24653c9636862b5c373045ff"`);
    await queryRunner.query(`DROP TABLE "timesheet_approvals"`);
    await queryRunner.query(`DROP TABLE "user_statuses"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3792ba7ce3ee793cf55d3a308a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_712444039e93513628513fa89a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d026fb529267ddb23a759d7812"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_bfef67e9afa18541460e965129"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_428eacd8106a365cb6d504fc1f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8a0232c472ac5fd98bc66dcfb2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9552793858873524524e6292dc"`);
    await queryRunner.query(`DROP TABLE "active_sessions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e49da5b4edf713f75a9cedbe67"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0385fdf771296e383c90c8a201"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4d5b34779ce0ce383408376696"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f41f8c6c1fb5eb042d2b37a45e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_45a18190352130763a12277cf6"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d4bc3e82a314fa9e29f652c2c2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3dacbb3eb4f095e29372ff8e13"`);
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_966722747d5714ca0004d10881"`);
    await queryRunner.query(`DROP TABLE "teams"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c6f2f91de84d85084a930657f1"`);
    await queryRunner.query(`DROP TABLE "team_members"`);
    await queryRunner.query(`DROP TABLE "company_settings"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6268d20a72e1b18dff32f35f45"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f4d20dc751e282273acfa47f57"`);
    await queryRunner.query(`DROP TABLE "timesheet_history"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_159d34ce6ffc2c05457cd13153"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_37f742cd24094240abfefe7c73"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3f3da1c533bf1ff4ffdb5b5b12"`);
    await queryRunner.query(`DROP TABLE "timesheet_entries"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7d68b6b580dee2d278730e2523"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3021b8f6838973d8ac4980c424"`);
    await queryRunner.query(`DROP TABLE "timesheets"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_57dcdcc9b48eaafef8d663f1a7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8b9e5da7fc2134b6406f3025ca"`);
    await queryRunner.query(`DROP TABLE "timesheet_rows"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cadb5135dddc76482563e8fe37"`);
    await queryRunner.query(`DROP TABLE "action_codes"`);
    await queryRunner.query(`DROP TABLE "menu_card"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4ab8d484cb775626084fbb0d61"`);
    await queryRunner.query(`DROP TABLE "menu_category"`);
  }
}
