import { DataSource } from "typeorm";
import { Planning } from "../database/entities/planning";
import { Poste } from "../database/entities/poste";
import { Employee } from "../database/entities/employee";

export interface ListPlanningFilter {
    limit: number
    page: number
    capacityMax?: number
}

export interface UpdatePlanningParams {
    poste: Poste
    employee: Employee
    start_datetime?: Date
    end_datetime?: Date
}

export class PlanningUsecase {
    constructor(private readonly db: DataSource) { }

    async listPlanning(listPlanningFilter: ListPlanningFilter): Promise<{ Plannings: Planning[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Planning, 'Planning')
        if (listPlanningFilter.capacityMax) {
            query.andWhere('Planning.capacity <= :capacityMax', { capacityMax: listPlanningFilter.capacityMax })
        }
        query.skip((listPlanningFilter.page - 1) * listPlanningFilter.limit)
        query.take(listPlanningFilter.limit)

        const [Plannings, totalCount] = await query.getManyAndCount()
        return {
            Plannings,
            totalCount
        }
    }

    async updatePlanning(id: number, {poste , employee,start_datetime, end_datetime}: UpdatePlanningParams): Promise<Planning | null> {
        const repo = this.db.getRepository(Planning)
        const planningToUpdate = await this.foundPlanningById(id)
        if (planningToUpdate === null) return null

        if(poste){
            planningToUpdate.poste = poste
        }
        if(employee){
            planningToUpdate.employee = employee
        }
        if (start_datetime) {
            planningToUpdate.start_datetime = start_datetime
        }
        if(end_datetime) {
            planningToUpdate.end_datetime = end_datetime
        }

        const planningUpdate = await repo.save(planningToUpdate)
        return planningUpdate
    }

    async verifyPlanning(start_datetime: Date, end_datetime: Date): Promise<any | null> {
        const entityManager = this.db;
        const sqlQuery = `SELECT COUNT(*) AS postesCouverts FROM planning WHERE start_datetime <= ? AND end_datetime >= ? AND posteId IN (1, 2, 3);`

        const planning = await entityManager.query(sqlQuery, [start_datetime, end_datetime])
        return planning
    }
    async verifyPoste(posteId: Poste, start_datetime: Date, end_datetime: Date): Promise<any | null> {
        const entityManager = this.db;
        const sqlQuery = `SELECT COUNT(*) FROM planning WHERE start_datetime <= ? AND end_datetime >= ? AND posteId = ?;`
        
        const planning = await entityManager.query(sqlQuery, [start_datetime, end_datetime, posteId])
        return planning
    }

    async foundPlanningById(id: number): Promise<Planning | null> {
        const repo = this.db.getRepository(Planning)
        const planning = await repo.findOneBy({ id })
        return planning
    }
}