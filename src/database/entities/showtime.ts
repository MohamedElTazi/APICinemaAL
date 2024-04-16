import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Salle } from "./salle";
import { Movie } from "./movie";


@Entity()
export class Showtime {
    static createQueryBuilder(arg0: string) {
        throw new Error("Method not implemented.");
    }
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Salle, salle => salle.showtimes)
    salle: Salle;

    @ManyToOne(() => Movie, movie => movie.showtimes)
    movie: Movie;

    @Column()
    date: Date;

    @Column()
    start_time: string;

    @Column()
    end_time: string;

    @Column()
    special_notes: string;

    constructor(id: number, salle: Salle, movie: Movie, date: Date, start_time: string, end_time:string,special_notes: string) {
        this.id = id, 
        this.salle = salle
        this.movie = movie
        this.date = date
        this.start_time = start_time
        this.end_time = end_time
        this.special_notes = special_notes
    }
}
