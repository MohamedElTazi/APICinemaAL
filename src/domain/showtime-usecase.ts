import {DataSource, SelectQueryBuilder } from "typeorm";
import { Showtime } from "../database/entities/showtime";
import { Movie } from "../database/entities/movie";
import { AppDataSource } from "../database/database";
import { format } from 'date-fns';
import { CreateShowtimeValidationRequest } from "../handlers/validators/showtime-validator";
import { TicketShowtimeAccesses } from "../database/entities/ticketShowtimeAccesses";

export interface ListShowtimeFilter {
    limit: number
    page: number
    salle?: number;
    movie?: number;
    start_datetime?: Date;  // Date et heure de début
    end_datetime?: Date;  // Date et heure de fin
    special_notes?: string;
}

export interface UpdateShowtimeParams {
    special_notes?: string
}


export class ShowtimeUsecase {
    constructor(private readonly db: DataSource) { }

    async listShowtime(listShowtimeFilter: ListShowtimeFilter): Promise<{ Showtimes: Showtime[]; totalCount: number; }> {
        console.log(listShowtimeFilter)
        const query = this.db.createQueryBuilder(Showtime, 'showtime')
        if (listShowtimeFilter.salle) {
            query.andWhere('showtime.salle <= :salle', { salle: listShowtimeFilter.salle })
        }
        if(listShowtimeFilter.movie){
            query.andWhere('showtime.movie <= :movie', { movie: listShowtimeFilter.movie })
        }
        if(listShowtimeFilter.start_datetime){
            query.andWhere('showtime.start_datetime <= :start_datetime', { start_datetime: listShowtimeFilter.start_datetime })
        }
        if(listShowtimeFilter.end_datetime){
            query.andWhere('showtime.end_datetime <= :end_datetime', { end_datetime: listShowtimeFilter.end_datetime })
        }
        if(listShowtimeFilter.special_notes){
            query.andWhere('showtime.special_notes <= :special_notes', { special_notes: listShowtimeFilter.special_notes })
        }

        query.leftJoinAndSelect('showtime.salle', 'salle')
        .leftJoinAndSelect('showtime.movie', 'movie')
        .skip((listShowtimeFilter.page - 1) * listShowtimeFilter.limit)
        .take(listShowtimeFilter.limit)

        const [Showtimes, totalCount] = await query.getManyAndCount()
        return {
            Showtimes,
            totalCount
        }
    }

    async getOneShowtime(id: number): Promise<Showtime | null> {
        const query = this.db.createQueryBuilder(Showtime, 'showtime')
        .leftJoinAndSelect('showtime.salle', 'salle')
        .leftJoinAndSelect('showtime.movie', 'movie')
        .where("showtime.id = :id", { id: id });

        // Exécuter la requête et récupérer le ticket avec les détails de l'utilisateur
        const showtime = await query.getOne();

        // Vérifier si le ticket existe
        if (!showtime) {
            console.log({ error: `Ticket ${id} not found` });
            return null;
        }
        return showtime
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

            const end_datetimeDate = new Date(start_datetime);    

            const formattedDate = format(end_datetimeDate, 'yyyy-MM-dd'); 

            let resultDate = new Date(formattedDate+"T"+result.duration);
            
            end_datetimeDate.setHours(end_datetimeDate.getHours() + resultDate.getHours());
            end_datetimeDate.setMinutes(end_datetimeDate.getMinutes() + resultDate.getMinutes());
            end_datetimeDate.setSeconds(end_datetimeDate.getSeconds() + resultDate.getSeconds());

            return end_datetimeDate;
    }

    async getShowtimePlanning(startDate:string, endDate:string): Promise<SelectQueryBuilder<Showtime> | null>{

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
    

    async isOverlap(newShowtime: CreateShowtimeValidationRequest): Promise<boolean> {
        const count = await this.db.getRepository(Showtime)
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


    async getCountByShowtimeId(showtimeId: number): Promise<number> {
        const count = await this.db.getRepository(TicketShowtimeAccesses).
        createQueryBuilder('ticketShowtimeAccess')
        .where('ticketShowtimeAccess.showtimeId = :showtimeId', { showtimeId })
        .getCount();
      
        return count;
      }

    
}