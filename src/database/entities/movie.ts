import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Showtime } from "./showtime";

@Entity()
export class Movie {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    duration: number;

    @Column()
    genre: string;

    @OneToMany(() => Showtime, showtime => showtime.salle)
    showtimes: Showtime[];


    constructor(id: number, title: string, description: string, duration: number, genre:string, showtimes: Showtime[]) {
        this.id = id, 
        this.title = title
        this.description = description
        this.duration = duration
        this.genre = genre
        this.showtimes = showtimes;

    }
}
