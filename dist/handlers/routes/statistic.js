"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticHandler = void 0;
const database_1 = require("../../database/database");
const statistic_usecase_1 = require("../../domain/statistic-usecase");
const StatisticHandler = (app) => {
    app.get("/statistics/sallesAttendance", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const statisticUsecase = new statistic_usecase_1.StatisticUsecase(database_1.AppDataSource);
            const statistic = yield statisticUsecase.getAttendanceSalles();
            if (statistic.length === 0) {
                res.status(200).send("No statistics");
                return;
            }
            res.status(200).send(statistic);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/statistics/totalAttendance", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const statisticUsecase = new statistic_usecase_1.StatisticUsecase(database_1.AppDataSource);
            const statistic = yield statisticUsecase.getTotalAttendance();
            if (statistic.length === 0) {
                res.status(200).send("No statistics");
                return;
            }
            res.status(200).send(statistic);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/statistics/realTimeAttendanceRate", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const statisticUsecase = new statistic_usecase_1.StatisticUsecase(database_1.AppDataSource);
            const statistic = yield statisticUsecase.realTimeAttendanceRate();
            if (statistic.length === 0) {
                res.status(200).send("No statistics");
                return;
            }
            res.status(200).send(statistic);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/statistics/filmPerformance", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const statisticUsecase = new statistic_usecase_1.StatisticUsecase(database_1.AppDataSource);
            const statistic = yield statisticUsecase.filmPerformance();
            if (statistic.length === 0) {
                res.status(200).send("No statistics");
                return;
            }
            res.status(200).send(statistic);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/statistics/numberOfTicketsPurchasedPerUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const statisticUsecase = new statistic_usecase_1.StatisticUsecase(database_1.AppDataSource);
            const statistic = yield statisticUsecase.numberOfTicketsPurchasedUser();
            if (statistic.length === 0) {
                res.status(200).send("No statistics");
                return;
            }
            res.status(200).send(statistic);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/statistics/transactionDetailsUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const statisticUsecase = new statistic_usecase_1.StatisticUsecase(database_1.AppDataSource);
            const statistic = yield statisticUsecase.transactionDetailsUser();
            if (statistic.length === 0) {
                res.status(200).send("No statistics");
                return;
            }
            res.status(200).send(statistic);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/statistics/usersAccessCurrentSessions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const statisticUsecase = new statistic_usecase_1.StatisticUsecase(database_1.AppDataSource);
            const statistic = yield statisticUsecase.usersAccessCurrentSessions();
            if (statistic.length === 0) {
                res.status(200).send("No statistics");
                return;
            }
            res.status(200).send(statistic);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/statistics/mostWatchedMovie", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const statisticUsecase = new statistic_usecase_1.StatisticUsecase(database_1.AppDataSource);
            const statistic = yield statisticUsecase.mostWatchedMovie();
            if (statistic.length === 0) {
                res.status(200).send("No statistics");
                return;
            }
            res.status(200).send(statistic);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/statistics/listOfFilmsByPopularity", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const statisticUsecase = new statistic_usecase_1.StatisticUsecase(database_1.AppDataSource);
            const statistic = yield statisticUsecase.listOfFilmsByPopularity();
            if (statistic.length === 0) {
                res.status(200).send("No statistics");
                return;
            }
            res.status(200).send(statistic);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
    app.get("/statistics/numberScreeningsPerFilm", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const statisticUsecase = new statistic_usecase_1.StatisticUsecase(database_1.AppDataSource);
            const statistic = yield statisticUsecase.numberScreeningsPerFilm();
            if (statistic.length === 0) {
                res.status(200).send("No statistics");
                return;
            }
            res.status(200).send(statistic);
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: "Internal error" });
        }
    }));
};
exports.StatisticHandler = StatisticHandler;
