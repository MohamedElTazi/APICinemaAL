import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Salle } from "./salle";
import { Movie } from "./movie";

@Entity()
export class Showtime {
    @PrimaryGeneratedColumn()
    showtime_id: number;

    @ManyToOne(() => Salle, salle => salle.showtimes)
    @JoinColumn({ name: "salle_id" })
    salle: Salle;

    @ManyToOne(() => Movie, movie => movie.showtimes)
    @JoinColumn({ name: "movie_id" })
    movie: Movie;

    @Column()
    start_time: Date;

    @Column()
    end_time: Date;

    @Column()
    special_notes: string;

    constructor(showtime_id: number, salle: Salle, movie: Movie, start_time: Date, end_time:Date,special_notes: string) {
        this.showtime_id = showtime_id, 
        this.salle = salle
        this.movie = movie
        this.start_time = start_time
        this.end_time = end_time
        this.special_notes = special_notes
    }
}
