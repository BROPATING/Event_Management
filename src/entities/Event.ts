import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";
import { Tier } from "./Tier";

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  venue: string;

  @Column()
  city: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ default: "draft" })
  status: "draft" | "published" | "cancelled";

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.events)
  @JoinColumn()
  organizer: User;

  @OneToMany(() => Tier, (tier) => tier.event, { cascade: true })
  tiers: Tier[];
}