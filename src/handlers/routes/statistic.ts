import express, { Request, Response } from "express"
import { AppDataSource } from "../../database/database"
import { createUserValidation, LoginUserValidation, userIdValidation } from "../validators/user-validator"
import { generateValidationErrorMessage } from "../validators/generate-validation-message";

import { UserUsecase } from "../../domain/user-usecase";
import { StatisticUsecase } from "../../domain/statistic-usecase";

export const StatisticHandler = (app: express.Express) => {
    app.get("/statistics/sallesAttendance", async (req: Request, res: Response) => {
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

    app.get("/statistics/totalAttendance", async (req: Request, res: Response) => {
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


    app.get("/statistics/realTimeAttendanceRate", async (req: Request, res: Response) => {
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


    app.get("/statistics/filmPerformance", async (req: Request, res: Response) => {
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
    


    app.get("/statistics/numberOfTicketsPurchasedPerUser", async (req: Request, res: Response) => {
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



    app.get("/statistics/transactionDetailsUser", async (req: Request, res: Response) => {
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

    app.get("/statistics/usersAccessCurrentSessions", async (req: Request, res: Response) => {
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
    
    app.get("/statistics/mostWatchedMovie", async (req: Request, res: Response) => {
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


    app.get("/statistics/listOfFilmsByPopularity", async (req: Request, res: Response) => {
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


    app.get("/statistics/numberScreeningsPerFilm", async (req: Request, res: Response) => {
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
