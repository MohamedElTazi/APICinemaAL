import express, { Request, Response } from "express"
import { AppDataSource } from "../../database/database"
import { createUserValidation, LoginUserValidation, userIdValidation } from "../validators/user-validator"
import { generateValidationErrorMessage } from "../validators/generate-validation-message";

import { UserUsecase } from "../../domain/user-usecase";
import { StatisticUsecase } from "../../domain/statistic-usecase";
import { authMiddlewareAdmin } from "../middleware/auth-middleware";

export const StatisticHandler = (app: express.Express) => {
    app.get("/statistics/sallesAttendance", authMiddlewareAdmin,async (req: Request, res: Response) => {
        try {
            const statisticUsecase = new StatisticUsecase(AppDataSource);

            const statistic = await statisticUsecase.getAttendanceSalles();

            if(statistic.length === 0) {
                res.status(200).send("No statistics")
                return;
            }

            res.status(200).send(statistic)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.get("/statistics/totalAttendance", authMiddlewareAdmin,async (req: Request, res: Response) => {
        try {
            const statisticUsecase = new StatisticUsecase(AppDataSource);

            const statistic = await statisticUsecase.getTotalAttendance();

            if(statistic.length === 0) {
                res.status(200).send("No statistics")
                return;
            }

            res.status(200).send(statistic)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    app.get("/statistics/realTimeAttendanceRate",authMiddlewareAdmin, async (req: Request, res: Response) => {
        try {
            const statisticUsecase = new StatisticUsecase(AppDataSource);

            const statistic = await statisticUsecase.realTimeAttendanceRate();

            if(statistic.length === 0) {
                res.status(200).send("No statistics")
                return;
            }

            res.status(200).send(statistic)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    app.get("/statistics/filmPerformance",authMiddlewareAdmin, async (req: Request, res: Response) => {
        try {
            const statisticUsecase = new StatisticUsecase(AppDataSource);

            const statistic = await statisticUsecase.filmPerformance();

            if(statistic.length === 0) {
                res.status(200).send("No statistics")
                return;
            }

            res.status(200).send(statistic)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })
    


    app.get("/statistics/numberOfTicketsPurchasedPerUser", authMiddlewareAdmin,async (req: Request, res: Response) => {
        try {
            const statisticUsecase = new StatisticUsecase(AppDataSource);

            const statistic = await statisticUsecase.numberOfTicketsPurchasedUser();

            if(statistic.length === 0) {
                res.status(200).send("No statistics")
                return;
            }

            res.status(200).send(statistic)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })



    app.get("/statistics/transactionDetailsUser",authMiddlewareAdmin,async (req: Request, res: Response) => {
        try {
            const statisticUsecase = new StatisticUsecase(AppDataSource);

            const statistic = await statisticUsecase.transactionDetailsUser();

            if(statistic.length === 0) {
                res.status(200).send("No statistics")
                return;
            }

            res.status(200).send(statistic)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })

    app.get("/statistics/usersAccessCurrentSessions",authMiddlewareAdmin, async (req: Request, res: Response) => {
        try {
            const statisticUsecase = new StatisticUsecase(AppDataSource);

            const statistic = await statisticUsecase.usersAccessCurrentSessions();

            if(statistic.length === 0) {
                res.status(200).send("No statistics")
                return;
            }

            res.status(200).send(statistic)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })
    
    app.get("/statistics/mostWatchedMovie",authMiddlewareAdmin, async (req: Request, res: Response) => {
        try {
            const statisticUsecase = new StatisticUsecase(AppDataSource);

            const statistic = await statisticUsecase.mostWatchedMovie();

            if(statistic.length === 0) {
                res.status(200).send("No statistics")
                return;
            }

            res.status(200).send(statistic)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    app.get("/statistics/listOfFilmsByPopularity", authMiddlewareAdmin,async (req: Request, res: Response) => {
        try {
            const statisticUsecase = new StatisticUsecase(AppDataSource);

            const statistic = await statisticUsecase.listOfFilmsByPopularity();

            if(statistic.length === 0) {
                res.status(200).send("No statistics")
                return;
            }

            res.status(200).send(statistic)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })


    app.get("/statistics/numberScreeningsPerFilm",authMiddlewareAdmin, async (req: Request, res: Response) => {
        try {
            const statisticUsecase = new StatisticUsecase(AppDataSource);

            const statistic = await statisticUsecase.numberScreeningsPerFilm();

            if(statistic.length === 0) {
                res.status(200).send("No statistics")
                return;
            }

            res.status(200).send(statistic)
        } catch (error) {
            console.log(error)
            res.status(500).send({ error: "Internal error" })
        }
    })
    
}


/** 
 * 
 * @openapi
 *
 * tags: [Statistics]
 *      
 *      
*/

/**
 * @openapi
 * /statistics/sallesAttendance:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get attendance statistics per salle
 *     description: Retrieve attendance statistics for each salle.
 *     responses:
 *       200:
 *         description: Attendance statistics per salle.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SalleAttendance'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

/**
 * @openapi
 * /statistics/totalAttendance:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get total attendance statistics
 *     description: Retrieve total attendance statistics.
 *     responses:
 *       200:
 *         description: Total attendance statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAttendance:
 *                   type: integer
 *                   description: Total number of attendees
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

/**
 * @openapi
 * /statistics/realTimeAttendanceRate:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get real-time attendance rate
 *     description: Retrieve real-time attendance rate.
 *     responses:
 *       200:
 *         description: Real-time attendance rate.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attendanceRate:
 *                   type: number
 *                   description: Real-time attendance rate
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

/**
 * @openapi
 * /statistics/filmPerformance:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get film performance statistics
 *     description: Retrieve film performance statistics.
 *     responses:
 *       200:
 *         description: Film performance statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FilmPerformance'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

/**
 * @openapi
 * /statistics/numberOfTicketsPurchasedPerUser:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get number of tickets purchased per user statistics
 *     description: Retrieve statistics on the number of tickets purchased per user.
 *     responses:
 *       200:
 *         description: Number of tickets purchased per user statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserTicketPurchase'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

/**
 * @openapi
 * /statistics/transactionDetailsUser:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get transaction details per user statistics
 *     description: Retrieve transaction details per user.
 *     responses:
 *       200:
 *         description: Transaction details per user statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserTransactionDetails'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

/**
 * @openapi
 * /statistics/usersAccessCurrentSessions:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get users' access to current sessions statistics
 *     description: Retrieve statistics on users' access to current sessions.
 *     responses:
 *       200:
 *         description: Users' access to current sessions statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserSessionAccess'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

/**
 * @openapi
 * /statistics/mostWatchedMovie:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get most watched movie statistics
 *     description: Retrieve statistics on the most watched movie.
 *     responses:
 *       200:
 *         description: Most watched movie statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mostWatchedMovie:
 *                   type: string
 *                   description: Title of the most watched movie
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

/**
 * @openapi
 * /statistics/listOfFilmsByPopularity:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get list of films by popularity statistics
 *     description: Retrieve statistics on the list of films by popularity.
 *     responses:
 *       200:
 *         description: List of films by popularity statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FilmPopularity'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */

/**
 * @openapi
 * /statistics/numberScreeningsPerFilm:
 *   get:
 *     tags:
 *       - Statistics
 *     summary: Get number of screenings per film statistics
 *     description: Retrieve statistics on the number of screenings per film.
 *     responses:
 *       200:
 *         description: Number of screenings per film statistics.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FilmScreenings'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
