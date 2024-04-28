import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Poste } from "./poste";

@Entity()
export class Employee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Poste, poste => poste.name)
    post: Poste[];

    @Column()
    workin_hours: string;

    constructor(id: number, name: string, post: Poste[], workin_hours: string) {
        this.id = id;
        this.name = name;
        this.post = post;
        this.workin_hours = workin_hours;
    }
}

