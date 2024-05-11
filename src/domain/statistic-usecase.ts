import { DataSource} from "typeorm";


export class StatisticUsecase {
    constructor(private readonly db: DataSource) { }

    async getAttendanceSalles(): Promise<any | null> {
        const entityManager = this.db;

        const sqlQuery = `
        SELECT
            salle.name AS salle_name,
            DATE(start_datetime) AS date,
            COUNT(ticket_showtime_accesses.ticketId) AS nb_tickets_sold,
            COUNT(DISTINCT showtime.id) AS nb_showtimes
        FROM
            salle
        JOIN showtime ON salle.id = showtime.salleId
        JOIN ticket_showtime_accesses ON showtime.id = ticket_showtime_accesses.showtimeId
        GROUP BY
            salle.name, DATE(start_datetime)
        ORDER BY
            date DESC;
        `;

        const query = await entityManager.query(sqlQuery);

        return query;
    }

    async getTotalAttendance(): Promise<any | null> {
        const entityManager = this.db;

        const sqlQuery = `
        SELECT
            DATE(start_datetime) AS date,
            COUNT(ticket_showtime_accesses.ticketId) AS nb_tickets_sold,
            COUNT(DISTINCT showtime.id) AS nb_showtimes
        FROM
            showtime
        JOIN ticket_showtime_accesses ON showtime.id = ticket_showtime_accesses.showtimeId
        GROUP BY
            DATE(start_datetime)
        ORDER BY
            date DESC;
        `;

        const query = await entityManager.query(sqlQuery);

        return query;
    }

    async realTimeAttendanceRate(): Promise<any | null> {
        const entityManager = this.db;

        const sqlQuery = `
        SELECT
            salle.name AS salle_name,
            NOW() AS time_checked,
            COUNT(DISTINCT ticket_showtime_accesses.ticketId) AS current_visitors
        FROM
            salle
        JOIN showtime ON salle.id = showtime.salleId
        JOIN ticket_showtime_accesses ON showtime.id = ticket_showtime_accesses.showtimeId
        WHERE
            showtime.start_datetime <= NOW() AND showtime.end_datetime >= NOW()
        GROUP BY
            salle.name;
        `;

        const query = await entityManager.query(sqlQuery);

        return query;
    }


    async filmPerformance(): Promise<any | null> {
        const entityManager = this.db;

        const sqlQuery = `
        SELECT
            salle.name AS salle_name,
            DATE_FORMAT(start_datetime, '%Y-%m-%d') AS date, -- Jour
            DATE_FORMAT(start_datetime, '%Y-%u') AS week, -- Semaine
            DATE_FORMAT(start_datetime, '%Y-%m') AS month, -- Mois
            DATE_FORMAT(start_datetime, '%Y') AS year, -- Année
            COUNT(ticket_showtime_accesses.ticketId) AS nb_tickets_sold
        FROM
            salle
        JOIN showtime ON salle.id = showtime.salleId
        JOIN ticket_showtime_accesses ON showtime.id = ticket_showtime_accesses.showtimeId
        GROUP BY
            salle.name, date, week, month, year
        ORDER BY
            year, month, week, date;
        `;

        const query = await entityManager.query(sqlQuery);

        return query;
    }
    
    async numberOfTicketsPurchasedUser(): Promise<any | null> {
        const entityManager = this.db;

        const sqlQuery = `
        SELECT 
            user.firstname, 
            user.lastname, 
            COUNT(ticket.id) AS tickets_purchased 
        FROM 
            user 
        JOIN 
            ticket ON user.id = ticket.userId 
        GROUP BY 
            user.id;
        `;

        const query = await entityManager.query(sqlQuery);

        return query;
    }
    

    async transactionDetailsUser(): Promise<any | null> {
        const entityManager = this.db;

        const sqlQuery = `
        SELECT 
            user.firstname, 
            user.lastname, 
            transaction.transaction_type, 
            transaction.amount, 
            transaction.transaction_date 
        FROM 
            user 
        JOIN 
            transaction ON user.id = transaction.userId 
        ORDER BY 
            transaction.transaction_date DESC;
        `;

        const query = await entityManager.query(sqlQuery);

        return query;
    }

    async usersAccessCurrentSessions(): Promise<any | null> {
        const entityManager = this.db;

        const sqlQuery = `
        SELECT DISTINCT
            user.firstname,
            user.lastname,
            showtime.start_datetime,
            movie.title
        FROM
            user
        JOIN
            ticket ON user.id = ticket.userId
        JOIN
            ticket_showtime_accesses ON ticket.id = ticket_showtime_accesses.ticketId
        JOIN
            showtime ON ticket_showtime_accesses.showtimeId = showtime.id
        JOIN
            movie ON showtime.movieId = movie.id
        WHERE
            showtime.start_datetime <= NOW() AND showtime.end_datetime >= NOW();
        `;

        const query = await entityManager.query(sqlQuery);

        return query;
    }


    async mostWatchedMovie(): Promise<any | null> {
        const entityManager = this.db;

        const sqlQuery = `
        SELECT
            movie.title,
            COUNT(ticket_showtime_accesses.ticketId) AS number_of_viewers
        FROM
            movie
        JOIN
            showtime ON movie.id = showtime.movieId
        JOIN
            ticket_showtime_accesses ON showtime.id = ticket_showtime_accesses.showtimeId
        GROUP BY
            movie.id
        ORDER BY
            number_of_viewers DESC
        LIMIT 1;
        `;

        const query = await entityManager.query(sqlQuery);

        return query;
    }
    

    async listOfFilmsByPopularity(): Promise<any | null> {
        const entityManager = this.db;

        const sqlQuery = `
        SELECT
            movie.title,
            COUNT(ticket_showtime_accesses.ticketId) AS number_of_viewers
        FROM
            movie
        JOIN
            showtime ON movie.id = showtime.movieId
        JOIN
            ticket_showtime_accesses ON showtime.id = ticket_showtime_accesses.showtimeId
        GROUP BY
            movie.id
        ORDER BY
            number_of_viewers DESC;
        `;

        const query = await entityManager.query(sqlQuery);

        return query;
    }


    async numberScreeningsPerFilm(): Promise<any | null> {
        const entityManager = this.db;

        const sqlQuery = `
        SELECT
            movie.title,
            COUNT(showtime.id) AS number_of_showtimes
        FROM
            movie
        JOIN
            showtime ON movie.id = showtime.movieId
        GROUP BY
            movie.id
        ORDER BY
            number_of_showtimes DESC;
        `;

        const query = await entityManager.query(sqlQuery);

        return query;
    }
    
    
}