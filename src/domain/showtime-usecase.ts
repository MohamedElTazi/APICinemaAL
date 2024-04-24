import { DataSource, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual } from "typeorm";
import { Showtime } from "../database/entities/showtime";
import { Salle } from "../database/entities/salle";
import { addMinutes } from 'date-fns';
import { Movie } from "../database/entities/movie";
import { AppDataSource } from "../database/database";
import { format } from 'date-fns';

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

    async getMovieDuration(movieId: number, start_datetime: Date) {

        const result = await AppDataSource
            .getRepository(Movie)
            .createQueryBuilder("movie")
            .select("duration")
            .where("id = :movieId", { movieId: movieId })
            .getRawOne();

            const start_datetimeDate = new Date(start_datetime);    

            const formattedDate = format(start_datetimeDate, 'yyyy-MM-dd'); 

            let resultDate = new Date(formattedDate+"T"+result.duration);
            
            start_datetimeDate.setHours(start_datetimeDate.getHours() + resultDate.getHours());
            start_datetimeDate.setMinutes(start_datetimeDate.getMinutes() + resultDate.getMinutes());
            start_datetimeDate.setSeconds(start_datetimeDate.getSeconds() + resultDate.getSeconds());

            return start_datetimeDate;
    }

    

    async isOverlap(newShowtime: Showtime): Promise<boolean> {
        const showtimeRepository = this.db.getRepository(Showtime);
    
        const count = await showtimeRepository
            .createQueryBuilder('showtime')
            .where('start_datetime <= :newEndDatetime', { newEndDatetime: newShowtime.end_datetime })
            .andWhere('DATE_ADD(end_datetime, INTERVAL 30 MINUTE) >= :newStartDatetime', { newStartDatetime: newShowtime.start_datetime })
            .andWhere('salleId = :salleId', { salleId: newShowtime.salle })
            .getCount();

        if (count === 0) {
            return false;
        }
        return true
    }
}