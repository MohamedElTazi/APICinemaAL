import { DataSource } from "typeorm";
import { Salle } from "../database/entities/salle";

export interface ListSalleFilter {
    limit: number
    page: number
    name?:string
    type?:string
    access_disabled?:boolean
    maintenance_status?:boolean
    capacityMax?: number
}

export interface UpdateSalleParams {
     capacity?: number
}

export interface UpdateSalleMaintenanceParams {
    maintenance_status: boolean
}


export class SalleUsecase {
    constructor(private readonly db: DataSource) { }

    async listSalle(listSalleFilter: ListSalleFilter): Promise<{ Salles: Salle[]; totalCount: number; }> {
        console.log(listSalleFilter)
        const query = this.db.createQueryBuilder(Salle, 'Salle')

        if (listSalleFilter.name) {
            query.andWhere('Salle.name = :name', { name: listSalleFilter.name })
        }
        if (listSalleFilter.type) {
            query.andWhere('Salle.type = :type', { type: listSalleFilter.type })
        }
        if (listSalleFilter.access_disabled) {
            query.andWhere('Salle.access_disabled = :access_disabled', { access_disabled: listSalleFilter.access_disabled })
        }
        if (listSalleFilter.maintenance_status) {
            query.andWhere('Salle.maintenance_status = :maintenance_status', { maintenance_status: listSalleFilter.maintenance_status })
        }
        if (listSalleFilter.capacityMax) {
            query.andWhere('Salle.capacity <= :capacityMax', { capacityMax: listSalleFilter.capacityMax })
        }

        
        query.skip((listSalleFilter.page - 1) * listSalleFilter.limit)
        query.take(listSalleFilter.limit)

        const [Salles, totalCount] = await query.getManyAndCount()
        return {
            Salles,
            totalCount
        }
    }

    async updateSalle(id: number, { capacity }: UpdateSalleParams): Promise<Salle | null> {
        const repo = this.db.getRepository(Salle)
        const Sallefound = await repo.findOneBy({ id })
        if (Sallefound === null) return null

        if (capacity) {
            Sallefound.capacity = capacity
        }

        const SalleUpdate = await repo.save(Sallefound)
        return SalleUpdate
    }

    async updateMaintenanceSalle(id: number, { maintenance_status }: UpdateSalleMaintenanceParams): Promise<Salle | null> {
        const repo = this.db.getRepository(Salle)
        const Sallefound = await repo.findOneBy({ id })
        if (Sallefound === null) return null

        if (maintenance_status===true || maintenance_status===false) {
            Sallefound.maintenance_status = maintenance_status
        }

        const SalleUpdate = await repo.save(Sallefound)
        return SalleUpdate
    }


    async getSallePlanning(startDate:string, endDate:string, id:number): Promise<SelectQueryBuilder<Showtime> | null>{

        let query = this.db.getRepository(Showtime)
        .createQueryBuilder("showtime")
        .leftJoinAndSelect("showtime.salle", "salle")
        .leftJoinAndSelect("showtime.movie", "movie")
        .select([
            "salle.name",
            "salle.description",
            "salle.type",
            "movie.title",
            "movie.description",
            "showtime.start_datetime",
            "showtime.end_datetime",
            "showtime.special_notes"
        ])
        .where("salle.maintenance_status = false")
        .andWhere("salle.id = :id", { id: id });
        if (startDate && endDate) {
            endDate = endDate + " 23:59:59"
            query = query.andWhere("showtime.start_datetime >= :startDate AND showtime.end_datetime <= :endDate", { startDate, endDate });
        }else if(startDate && !endDate){
            query = query.andWhere("showtime.start_datetime >= :startDate", { startDate });
        }else if(!startDate && endDate){
            endDate = endDate + " 23:59:59"
            query = query.andWhere("showtime.end_datetime <= :endDate", { endDate });
        }

        return query;

    }
}