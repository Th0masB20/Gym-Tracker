import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IReqVerification, ICookieTicket, IUserToken } from '../interfaces/IAuthorization';

async function authorize(req: Request, _res: Response, next: NextFunction) {
    const token: ICookieTicket = req.cookies as ICookieTicket;

    try {
        const validation = jwt.verify(token.ticket, process.env.SECRET_STRING as jwt.Secret) as IUserToken;
        (req as IReqVerification).token = validation;
        next();
    }
    catch (error) {
        (error as Error).message += ' access';
        next(error);
    }
}

export default authorize;