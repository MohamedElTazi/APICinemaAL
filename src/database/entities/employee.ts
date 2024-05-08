import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Planning } from "./planning";

@Entity()
export class Employee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @OneToMany(() => Planning, planning => planning.employee)
    plannings: Planning[];


    @Column()
    working_hours: string;

    constructor(id: number, name: string, plannings: Planning[], working_hours: string) {
        this.id = id;
        this.name = name;
        this.plannings = plannings;
        this.working_hours = working_hours;
    }
}

