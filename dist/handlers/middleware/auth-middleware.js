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
exports.authMiddlewareUser = exports.authMiddlewareAdmin = exports.authMiddlewareSuperAdmin = exports.authMiddlewareAll = void 0;
const database_1 = require("../../database/database");
const token_1 = require("../../database/entities/token");
const jsonwebtoken_1 = require("jsonwebtoken");
const authMiddlewareAll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return res.status(401).json({ "error": "Unauthorized" });
    const token = authHeader.split(' ')[1];
    if (token === null)
        return res.status(401).json({ "error": "Unauthorized" });
    const tokenRepo = database_1.AppDataSource.getRepository(token_1.Token);
    const tokenFound = yield tokenRepo.findOne({ where: { token } });
    if (!tokenFound) {
        return res.status(403).json({ "error": "Access Forbidden" });
    }
    const secret = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "azerty";
    (0, jsonwebtoken_1.verify)(token, secret, (err, user) => {
        if (err)
            return res.status(403).json({ "error": "Access Forbidden" });
        req.user = user;
        next();
    });
});
exports.authMiddlewareAll = authMiddlewareAll;
const authMiddlewareSuperAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return res.status(401).json({ "error": "Unauthorized" });
    const token = authHeader.split(' ')[1];
    if (!token)
        return res.status(401).json({ "error": "Unauthorized" });
    const tokenRepo = database_1.AppDataSource.getRepository(token_1.Token);
    const tokenFound = yield tokenRepo.findOne({ where: { token } });
    if (!tokenFound) {
        return res.status(403).json({ "error": "Access Forbidden" });
    }
    const secret = (_b = process.env.JWT_SECRET) !== null && _b !== void 0 ? _b : "azerty";
    (0, jsonwebtoken_1.verify)(token, secret, (err, user) => {
        if (err)
            return res.status(403).json({ "error": "Access Forbidden" });
        req.user = user;
        next();
    });
});
exports.authMiddlewareSuperAdmin = authMiddlewareSuperAdmin;
const authMiddlewareAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return res.status(401).json({ "error": "Unauthorized" });
    const token = authHeader.split(' ')[1];
    if (token === null)
        return res.status(401).json({ "error": "Unauthorized" });
    const tokenRepo = database_1.AppDataSource.getRepository(token_1.Token);
    const tokenFound = yield tokenRepo
        .createQueryBuilder("token")
        .innerJoinAndSelect("token.user", "user")
        .where("token.token = :token", { token })
        .getOne();
    if (!tokenFound) {
        return res.status(403).json({ "error": "Access Forbidden" });
    }
    console.log(tokenFound.user.role);
    if (tokenFound.user.role !== "administrator") {
        return res.status(403).json({ "error": "Access Denied: Administrator role required" });
    }
    const secret = (_c = process.env.JWT_SECRET) !== null && _c !== void 0 ? _c : "azerty";
    (0, jsonwebtoken_1.verify)(token, secret, (err, user) => {
        if (err)
            return res.status(403).json({ "error": "Access Forbidden" });
        req.user = user;
        next();
    });
});
exports.authMiddlewareAdmin = authMiddlewareAdmin;
const authMiddlewareUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return res.status(401).json({ "error": "Unauthorized" });
    const token = authHeader.split(' ')[1];
    if (token === null)
        return res.status(401).json({ "error": "Unauthorized" });
    const tokenRepo = database_1.AppDataSource.getRepository(token_1.Token);
    const tokenFound = yield tokenRepo
        .createQueryBuilder("token")
        .innerJoinAndSelect("token.user", "user")
        .where("token.token = :token", { token })
        .getOne();
    if (!tokenFound) {
        return res.status(403).json({ "error": "Access Forbidden" });
    }
    if (tokenFound.user.role !== "user") {
        return res.status(403).json({ "error": "Access Denied: User role required" });
    }
    const secret = (_d = process.env.JWT_SECRET) !== null && _d !== void 0 ? _d : "azerty";
    (0, jsonwebtoken_1.verify)(token, secret, (err, user) => {
        if (err)
            return res.status(403).json({ "error": "Access Forbidden" });
        req.user = user;
        next();
    });
});
exports.authMiddlewareUser = authMiddlewareUser;
