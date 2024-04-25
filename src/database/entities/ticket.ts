import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { User } from "./user";
import { TicketShowtimeAccesses } from "./ticketShowtimeAccesses";


@Entity()
export class Ticket {    

        @PrimaryGeneratedColumn()
        id: number;
    
        @ManyToOne(() => User, user => user.tokens)
        user: User;
    
        @Column()
        is_used: boolean;
    
        @Column()
        is_super: boolean;
    
        @Column()
        nb_tickets: number;
    
        @OneToMany(() => TicketShowtimeAccesses, ticket_showtime_accesses => ticket_showtime_accesses.ticket)
        ticket_showtime_accesses: TicketShowtimeAccesses[];

        constructor(id: number, user: User, is_used: boolean, is_super: boolean, nb_tickets: number, ticket_showtime_accesses: TicketShowtimeAccesses[]) {
            this.id = id;
            this.user = user;
            this.is_used = is_used;
            this.is_super = is_super;
            this.nb_tickets = nb_tickets;
            this.ticket_showtime_accesses = ticket_showtime_accesses;

        }
}
