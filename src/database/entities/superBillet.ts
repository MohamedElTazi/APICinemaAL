import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Ticket } from './billet';

@Entity()
export class SuperTicketAccess {
    @PrimaryGeneratedColumn()
    access_id: number;

    @ManyToOne(() => Ticket, (ticket) => ticket.superTicketAccess)
    @JoinColumn({ name: 'ticket_id' })
    ticket: Ticket;

    @Column({ default: 10 })
    nb_tickets: number;

constructor( nb_tickets: number ,ticket: Ticket , access_id: number){
this.access_id =access_id;
this.nb_tickets =nb_tickets;
this.ticket =ticket;
    }
}