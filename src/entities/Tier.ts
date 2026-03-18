import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Event } from "./Event";
import { Booking } from "./Booking";

@Entity()
export class Tier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;

  @Column()
  totalCapacity: number;

  @Column()
  availableSeats: number;

  @ManyToOne(() => Event, (event) => event.tiers)
  @JoinColumn()
  event: Event;

  @OneToMany(() => Booking, (booking) => booking.tier)
  bookings: Booking[];
}