import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../BaseEntity";
import { WebhookOutbox } from "./WebhookOutbox";

@Entity("webhook_deliveries")
@Index(["outboxId"])
export class WebhookDelivery extends BaseEntity {
  @Column("uuid") outboxId!: string;
  @ManyToOne(() => WebhookOutbox, { onDelete: "CASCADE" })
  @JoinColumn({ name: "outboxId" })
  outbox!: WebhookOutbox;

  @Column({ type: "text" }) url!: string;
  @Column({ type: "text" }) method!: string; // POST
  @Column({ type: "int" }) statusCode!: number;

  @Column({ type: "jsonb", nullable: true }) requestHeaders?: Record<
    string,
    string
  >;
  @Column({ type: "jsonb", nullable: true }) responseHeaders?: Record<
    string,
    string
  >;

  @Column({ type: "text", nullable: true }) responseBody?: string;
  @Column({ type: "int", nullable: true }) durationMs?: number;
}
