import { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { Movie } from "../database/entities/movie";
import { Showtime } from "../database/entities/showtime";

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
    
        // Convertit les heures et les minutes en chaîne, ajoutant un zéro au début si nécessaire
        const hoursStr = hours.toString().padStart(2, '0');
        const minutesStr = remainingMinutes.toString().padStart(2, '0');
    
        return `${hoursStr}:${minutesStr}:00`; // Format HH:mm:ss
    }

    async updateShowtimeEndDatetimesOnFilmDurationChange(movieId: number,  newDurationMinutes: number) {
        console.log(newDurationMinutes)

        const showtimes = await this.db.getRepository(Showtime)
        .createQueryBuilder("showtime")
        .where("showtime.movieId = :movieId", { movieId })
        .getMany();

        const updatePromises = showtimes.map(showtime => {
        let newEndDatetime = new Date(showtime.start_datetime.getTime() + newDurationMinutes * 60000);


        if (isNaN(newEndDatetime.getTime())) {
            console.error("Failed to calculate newEndDatetime for showtime:", showtime.id);
            throw new Error("Invalid newEndDatetime calculated");
        }

        return this.db.getRepository(Showtime)
            .createQueryBuilder()
            .update(Showtime)
            .set({ end_datetime: newEndDatetime })
            .where("id = :id", { id: showtime.id })
            .execute();
    });

    await Promise.all(updatePromises);
    }
}