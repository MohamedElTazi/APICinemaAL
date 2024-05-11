import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Employee } from "./employee";
import { Poste } from "./poste";

@Entity()
export class Planning {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Employee, employee => employee.id)
    employee: Employee;

    @ManyToOne(() => Poste, poste => poste.id)
    poste: Poste;


    @Column()
    start_datetime: Date;

    @Column()
    end_datetime: Date;

    constructor(id: number, employees: Employee, postes: Poste, start_datetime: Date, end_datetime: Date) {
        this.id = id;
        this.employee = employees;
        this.poste = postes;
        this.start_datetime = start_datetime;
        this.end_datetime = end_datetime;
    }
}