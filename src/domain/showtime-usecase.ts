import { DataSource } from "typeorm";
import { Showtime } from "../database/entities/showtime";

export interface ListShowtimeFilter {
    limit: number
    page: number
    name?:string
    type?:string
    access_disabled?:boolean
    maintenance_status?:boolean
    capacityMax?: number
}

export interface UpdateShowtimeParams {
    special_notes?: string
}


export class ShowtimeUsecase {
    constructor(private readonly db: DataSource) { }

    async listShowtime(listShowtimeFilter: ListShowtimeFilter): Promise<{ Showtimes: Showtime[]; totalCount: number; }> {
        console.log(listShowtimeFilter)
        const query = this.db.createQueryBuilder(Showtime, 'Showtime')
        if (listShowtimeFilter.capacityMax) {
            query.andWhere('Showtime.capacity <= :capacityMax', { capacityMax: listShowtimeFilter.capacityMax })
        }
        query.skip((listShowtimeFilter.page - 1) * listShowtimeFilter.limit)
        query.take(listShowtimeFilter.limit)

        const [Showtimes, totalCount] = await query.getManyAndCount()
        return {
            Showtimes,
            totalCount
        }
    }

    async updateShowtime(id: number, { special_notes }: UpdateShowtimeParams): Promise<Showtime | null> {
        const repo = this.db.getRepository(Showtime)
        const Showtimefound = await repo.findOneBy({ id })
        if (Showtimefound === null) return null

        if (special_notes) {
            Showtimefound.special_notes = special_notes
        }

        const ShowtimeUpdate = await repo.save(Showtimefound)
        return ShowtimeUpdate
    }

}