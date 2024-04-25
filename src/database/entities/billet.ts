import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user';
import { Showtime } from './showtime';

@Entity()
export class Ticket {
    @PrimaryGeneratedColumn()
    ticket_id: number;

    @ManyToOne(() => Showtime, (showtime) => showtime.tickets)
    @JoinColumn({ name: 'showtime_id' })
    showtime: Showtime;

    @ManyToOne(() => User, (user) => user.tickets)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ default: false })
    is_used : boolean;

    @Column({ default: false })
    is_super: boolean;
    superTicketAccess: any;

    constructor(ticket_id: number, showtime: Showtime, user: User, is_used: boolean,  is_super: boolean) {
        this.ticket_id = ticket_id, 
        this.user = user
        this.showtime = showtime;
        this.is_used = is_used
        this.is_super = is_super;

    }
}
