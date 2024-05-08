import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Planning } from "./planning";

@Entity()
export class Poste {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Planning, planning => planning.poste)
    plannings: Planning[];

    @Column()
    description: string;

    constructor(id: number, name: string, plannings: Planning[], description: string) {
        this.id = id;
        this.name = name;
        this.plannings = plannings;
        this.description = description;
    }
}