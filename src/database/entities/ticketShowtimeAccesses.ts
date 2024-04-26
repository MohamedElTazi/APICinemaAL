import {Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import { Ticket } from "./ticket";
import { Showtime } from "./showtime";

@Entity()
export class TicketShowtimeAccesses {    

        @PrimaryGeneratedColumn()
        id: number;

        @ManyToOne(() => Ticket, ticket => ticket.ticket_showtime_accesses)
        ticket: Ticket;

        @ManyToOne(() => Showtime, showtime => showtime.ticket_showtime_accesses)
        showtime: Showtime;
    
        constructor(id: number, ticket: Ticket, showtime: Showtime) {
            this.id = id;
            this.ticket = ticket;
            this.showtime = showtime;
        }
}
