import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Poste {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    constructor(id: number, name: string, description: string) {
        this.id = id;
        this.name = name;
        this.description = description;
    }
}