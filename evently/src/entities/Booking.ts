import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Tier } from "./Tier";

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column({ default: "active" })
  status: "active" | "cancelled";

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Tier, (tier) => tier.bookings)
  @JoinColumn()
  tier: Tier;
}