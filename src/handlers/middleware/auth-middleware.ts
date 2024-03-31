import { NextFunction, Response, Request } from "express";
import { AppDataSource } from "../../database/database";
import { Token } from "../../database/entities/token";
import { verify } from "jsonwebtoken";


export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({"error": "Unauthorized"});

    const token = authHeader.split(' ')[1];
    if (token === null) return res.status(401).json({"error": "Unauthorized"});

    const tokenRepo = AppDataSource.getRepository(Token)

    const tokenFound = await tokenRepo.findOne({ where: { token } })


    if (!tokenFound) {
        return res.status(403).json({"error": "Access Forbidden"})
    }
    console.log("secret:::: ")


    const secret = process.env.JWT_SECRET ?? "azerty"
    console.log("secret:::: "+secret)
    verify(token, secret, (err, user) => {
        if (err) return res.status(403).json({"error": "Access Forbidden"});
        (req as any).user = user;
        next();
    });
}