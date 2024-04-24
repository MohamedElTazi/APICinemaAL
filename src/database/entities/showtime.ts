import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import { Salle } from "./salle";
import { Movie } from "./movie";


@Entity()
export class Showtime {    
        @PrimaryGeneratedColumn()
        id: number;
    
        @ManyToOne(() => Salle, salle => salle.showtimes)
        salle: Salle;
    
        @ManyToOne(() => Movie, movie => movie.showtimes)
        movie: Movie;
    
        @Column()
        start_datetime: Date;  // Date et heure de début
    
        @Column()
        end_datetime: Date;  // Date et heure de fin
    
        @Column()
        special_notes: string;
    
        constructor(id: number, salle: Salle, movie: Movie, start_datetime: Date, end_datetime: Date, special_notes: string) {
            this.id = id;
            this.salle = salle;
            this.movie = movie;
            this.start_datetime = start_datetime;
            this.end_datetime = end_datetime;
            this.special_notes = special_notes;
        }
}
