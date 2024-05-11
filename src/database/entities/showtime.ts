import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { Salle } from "./salle";
import { Movie } from "./movie";
import { TicketShowtimeAccesses } from "./ticketShowtimeAccesses";


@Entity()
export class Showtime {    
        @PrimaryGeneratedColumn()
        id: number;
    
        @ManyToOne(() => Salle, salle => salle.showtimes)
        salle: Salle;
    
        @ManyToOne(() => Movie, movie => movie.showtimes)
        movie: Movie;
    
        @Column()
        start_datetime: Date;
        @Column()
        end_datetime: Date;  
    
        @Column()
        special_notes: string;

        @OneToMany(() => TicketShowtimeAccesses, ticket_showtime_accesses => ticket_showtime_accesses.ticket)
        ticket_showtime_accesses: TicketShowtimeAccesses[];
    
        constructor(id: number, salle: Salle, movie: Movie, start_datetime: Date, end_datetime: Date, special_notes: string, ticket_showtime_accesses: TicketShowtimeAccesses[]) {
            this.id = id;
            this.salle = salle;
            this.movie = movie;
            this.start_datetime = start_datetime;
            this.end_datetime = end_datetime;
            this.special_notes = special_notes;
            this.ticket_showtime_accesses = ticket_showtime_accesses;
        }
}