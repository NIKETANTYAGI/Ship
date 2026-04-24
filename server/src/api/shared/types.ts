import { Response } from "express";

/**
 * Standard Success Response Helper
 */
export const sendSuccess = (res: Response, data: any, statusCode: number = 200) => {
    return res.status(statusCode).json({
        success: true,
        data
    });
};

/**
 * Standard Error Response Helper
 */
export const sendError = (res: Response, code: string, message: string, statusCode: number = 500) => {
    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message
        }
    });
};

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: "USER" | "ADMIN";
}

export interface Shipment {
    id: string;
    awb?: string;
    status: string;
    charge: number;
}
