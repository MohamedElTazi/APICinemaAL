import { DataSource, DeleteResult } from "typeorm";
import { Token } from "../database/entities/token";
import { User } from "../database/entities/user";

export class UserUsecase {
    constructor(private readonly db: DataSource) { }

    async deleteToken(id: number): Promise<DeleteResult> {

        const TokenDelete = await this.db.createQueryBuilder().delete().from(Token).where("userId = :id", { id: id }).execute();

        return TokenDelete;

    }


    
    async getUsersInfos(): Promise<any | null>{

        const entityManager = this.db.getRepository(User); // ou vous pouvez utiliser getRepository si vous préférez

        const sqlQuery = `
        SELECT
          u.id AS user_id,
          u.firstname,
          u.lastname,
          u.email,
          u.role,
          u.balance,
          COUNT(DISTINCT t.id) AS total_tickets,
          SUM(CASE WHEN t.is_used = TRUE THEN 1 ELSE 0 END) AS tickets_used,
          SUM(t.nb_tickets) AS total_tickets_purchased,
          COUNT(DISTINCT ts.id) AS total_ticket_showtime_accesses,
          COUNT(DISTINCT tr.id) AS total_transactions,
          GROUP_CONCAT(DISTINCT m.title ORDER BY m.title ASC SEPARATOR ', ') AS movies_watched,
          GROUP_CONCAT(DISTINCT CONCAT(s.id, ':', s.start_datetime, '-', s.end_datetime) ORDER BY s.id ASC SEPARATOR ', ') AS showtimes_info
        FROM
          user u
        LEFT JOIN
          ticket t ON u.id = t.userId
        LEFT JOIN
          ticket_showtime_accesses ts ON t.id = ts.ticketId
        LEFT JOIN
          transaction tr ON u.id = tr.userId
        LEFT JOIN
          showtime s ON ts.showtimeId = s.id
        LEFT JOIN
          movie m ON s.movieId = m.id
        GROUP BY
          u.id;
        `;
        
        const users = await entityManager.query(sqlQuery);
        
        return users;

    }

    async getUserInfos(id: number): Promise<any | null> {
        const entityManager = this.db.getRepository(User);
    
        const sqlQuery = `
        SELECT
            u.id AS user_id,
            u.firstname,
            u.lastname,
            u.email,
            u.role,
            u.balance,
            COUNT(DISTINCT t.id) AS total_tickets,
            SUM(CASE WHEN t.is_used = TRUE THEN 1 ELSE 0 END) AS tickets_used,
            SUM(t.nb_tickets) AS total_tickets_purchased,
            COUNT(DISTINCT ts.id) AS total_ticket_showtime_accesses,
            COUNT(DISTINCT tr.id) AS total_transactions,
            GROUP_CONCAT(DISTINCT m.title ORDER BY m.title ASC SEPARATOR ', ') AS movies_watched,
            GROUP_CONCAT(DISTINCT CONCAT(s.id, ':', s.start_datetime, '-', s.end_datetime) ORDER BY s.id ASC SEPARATOR ', ') AS showtimes_info
        FROM
            user u
        LEFT JOIN
            ticket t ON u.id = t.userId
        LEFT JOIN
            ticket_showtime_accesses ts ON t.id = ts.ticketId
        LEFT JOIN
            transaction tr ON u.id = tr.userId
        LEFT JOIN
            showtime s ON ts.showtimeId = s.id
        LEFT JOIN
            movie m ON s.movieId = m.id
        WHERE u.id = ?
        GROUP BY
            u.id;
        `;
    
        const users = await entityManager.query(sqlQuery, [id]);
    
        return users;
    }
    
    
}