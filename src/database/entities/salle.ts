import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Showtime } from "./showtime";

@Entity()
export class Salle {
    @PrimaryGeneratedColumn()
    salle_id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    type: string;

    @Column()
    capacity: number;

    @Column({default: false})
    access_disabled: boolean = false;

    @Column({default: false})
    maintenance_status: boolean = false;

    @OneToMany(() => Showtime, showtime => showtime.salle)
    showtimes: Showtime[];

    constructor(salle_id: number, name: string, description: string, type: string, capacity:number,showtimes: Showtime[]) {
        this.salle_id = salle_id, 
        this.name = name
        this.description = description
        this.type = type
        this.capacity = capacity
        this.showtimes = showtimes;
    }
}
