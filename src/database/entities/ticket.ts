import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { User } from "./user";
import { Transaction } from "./transaction";

import { TicketShowtimeAccesses } from "./ticketShowtimeAccesses";


@Entity()
export class Ticket {    

        @PrimaryGeneratedColumn()
        id: number;
    
        @ManyToOne(() => User, user => user.tickets)
        user: User;
    
        @Column()
        is_used: boolean;
    
        @Column()
        is_super: boolean;
    
        @Column()
        price: number;

        @Column()
        nb_tickets: number;

        @OneToMany(() => TicketShowtimeAccesses, ticket_showtime_accesses => ticket_showtime_accesses.ticket)
        ticket_showtime_accesses: TicketShowtimeAccesses[];

        @OneToMany(() => Transaction, transactions => transactions.ticket)
        transactions: Transaction[];


        constructor(id: number, user: User, is_used: boolean, is_super: boolean, nb_tickets: number, price: number,ticket_showtime_accesses: TicketShowtimeAccesses[], transactions: Transaction[]) {
            this.id = id;
            this.user = user;
            this.is_used = is_used;
            this.is_super = is_super;
            this.nb_tickets = nb_tickets;
            this.price = price;
            this.ticket_showtime_accesses = ticket_showtime_accesses;
            this.transactions = transactions;
        }
}
