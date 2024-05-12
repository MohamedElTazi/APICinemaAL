import { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { Movie } from "../database/entities/movie";
import { Showtime } from "../database/entities/showtime";
import { AppDataSource } from "../database/database";
import { ShowtimeUsecase } from "./showtime-usecase";
import { PlanningUsecase } from "./planning-usecase";

export interface ListMovieFilter {
    page: number
    limit: number
}
export interface ListMovieRequest {
    page?: number
    limit?: number
}
export interface UpdateMovieParams {
    title?: string
    description?: string
    duration?: string
    genre?: string
}
export class MovieUsecase {
    constructor(private db: DataSource) {}
    async listSalle(listMovieFilter: ListMovieFilter): Promise<{ Movies: Movie[]; totalCount: number; }> {
        const query = this.db.createQueryBuilder(Movie, 'Movie')
        query.skip((listMovieFilter.page - 1) * listMovieFilter.limit)
        query.take(listMovieFilter.limit)

        const [Movies, totalCount] = await query.getManyAndCount()
        return {
            Movies,
            totalCount
        }
    }

    async updateMovie(id: number, {title, description, duration, genre}: UpdateMovieParams): Promise<Movie | undefined> {
        const repo = this.db.getRepository(Movie)
        const movieToUpdate = await repo.findOneBy({id})
        if (!movieToUpdate) return undefined

        if(title){
            movieToUpdate.title = title
        }
        if(description){
            movieToUpdate.description = description
        }
        if(duration){
            movieToUpdate.duration = duration
        }
        if(genre){
            movieToUpdate.genre = genre
        }
        
        const MovieUpdated = await repo.save(movieToUpdate)
        return MovieUpdated
    }

    async getMoviePlanning(startDate:string, endDate:string, id:number): Promise<SelectQueryBuilder<Showtime> | null>{

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
        .andWhere("movie.id = :id", { id: id });
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

    async getMovieAvailable(): Promise<SelectQueryBuilder<Showtime> | null>{

        let query = this.db.getRepository(Showtime)
        .createQueryBuilder("showtime")
        .leftJoinAndSelect("showtime.salle", "salle")
        .leftJoinAndSelect("showtime.movie", "movie")
        .select([
            "salle.id",
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
        .andWhere("showtime.start_datetime >= NOW()");

        return query;

    }
    

    formatTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
    
        const hoursStr = hours.toString().padStart(2, '0');
        const minutesStr = remainingMinutes.toString().padStart(2, '0');
    
        return `${hoursStr}:${minutesStr}:00`; 
    }
    

    async updateShowtimeEndDatetimesOnFilmDurationChange(movieId: number, newDurationMinutes: number): Promise<void|string> {
        
        const showtimes = await this.db.getRepository(Showtime)
            .createQueryBuilder("showtime")
            .where("showtime.movieId = :movieId", { movieId })
            .andWhere("showtime.start_datetime >= NOW()")
            .getMany();

        console.log(showtimes)

    
        for (const showtime of showtimes) {

            console.log(showtime.id)
            
            const showtimeById = await new ShowtimeUsecase(AppDataSource).foundShowtime(showtime.id);
    
            if (showtimeById === null) {
                console.log({ error: `Showtime not found for ID: ${showtime.id}` });
                return `Showtime not found`;
            }
            
    
            const startDatetime = showtime.start_datetime ?? showtimeById.start_datetime;
            const endDatetime = showtime.end_datetime ?? showtimeById.end_datetime;
            const verifyPlanning = await new PlanningUsecase(AppDataSource).verifyPlanning(startDatetime, endDatetime);
    
            if (verifyPlanning[0].postesCouverts !== "3") {
                console.log({ "error": `Not all employees are available for showtime ID: ${showtime.id}` });
                return `Not all employees are available`;
            }

        }
    


        for (const showtime of showtimes) {
            let newEndDatetime = new Date(showtime.start_datetime.getTime() + newDurationMinutes * 60000);
    
            if (isNaN(newEndDatetime.getTime())) {
                console.error(`Failed to calculate newEndDatetime for showtime: ${showtime.id}`);
                continue;
            }
    
    
            await this.db.getRepository(Showtime)
                .createQueryBuilder()
                .update(Showtime)
                .set({ end_datetime: newEndDatetime })
                .where("id = :id", { id: showtime.id })
                .execute();
        }
    }
    
}