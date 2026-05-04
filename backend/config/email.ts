import nodemailer from "nodemailer";
import dotenv from "dotenv";

/**
 * Loads environment variables from the .env file.
 */
dotenv.config();

/**
 * Nodemailer email transport configuration.
 * Uses the Gmail service with credentials defined in the environment variables.
 */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export default transporter;