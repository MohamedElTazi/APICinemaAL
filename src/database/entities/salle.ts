import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Salles {
    @PrimaryGeneratedColumn()
    salle_id: number;

    @Column({ type: "varchar", length: 255 })
    name: string;

    @Column({ type: "text" })
    description: string;

    @Column({ type: "varchar", length: 100 })
    type: string;

    @Column({ type: "int" })
    capacity: number;

    @Column({ type: "boolean", default: false })
    access_disabled: boolean = false;

    @Column({ type: "boolean", default: false })
    maintenance_status: boolean = false;

    constructor(salle_id: number, name: string, description: string, type: string, capacity:number) {
        this.salle_id = salle_id, 
        this.name = name
        this.description = description
        this.type = type
        this.capacity = capacity

    }
}
