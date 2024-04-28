import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import { User } from "./user";
import { TicketShowtimeAccesses } from "./ticketShowtimeAccesses";

/*    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT REFERENCES user(id),
    is_used BOOLEAN DEFAULT FALSE,
    is_super BOOLEAN NOT NULL,
    prix INT NOT NULL, 
    nb_tickets INT NOT NULL
);
*/
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
        amount: number;
        @Column()
        nb_tickets: number;
    
        @OneToMany(() => TicketShowtimeAccesses, ticket_showtime_accesses => ticket_showtime_accesses.ticket)
        ticket_showtime_accesses: TicketShowtimeAccesses[];

        constructor(id: number, user: User, is_used: boolean, is_super: boolean,   amount: number,nb_tickets: number, ticket_showtime_accesses: TicketShowtimeAccesses[]) {
            this.id = id;
            this.user = user;
            this.is_used = is_used;
            this.is_super = is_super;
            this.nb_tickets = nb_tickets;
            this.ticket_showtime_accesses = ticket_showtime_accesses;
            this.amount = amount;

        }
}
