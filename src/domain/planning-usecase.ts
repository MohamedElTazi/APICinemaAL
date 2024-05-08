import { DataSource } from "typeorm";
import { Planning } from "../database/entities/planning";

export interface ListPlanningFilter {
    limit: number
    page: number
    capacityMax?: number
}

export interface UpdatePlanningParams {
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

    async updatePlanning(id: number, {start_datetime, end_datetime}: UpdatePlanningParams): Promise<Planning | Date | undefined> {
        const repo = this.db.getRepository(Planning)
        const planningToUpdate = await repo.findOneBy({ id })
        if (planningToUpdate === null) return undefined

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
}