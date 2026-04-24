import { asyncHandler } from "../../../middleware/asyncHandler";
import pool from "../../../Database/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {

    const { name, email, phone, password, username } = req.body;

    if (!name || !email || !phone || !password || !username) {
        return res.status(400).json({
            success: false,
            error: { code: "AUTH_001", message: "All fields are required" }
        });
    }

    const existingUser = await pool.query(
        "SELECT id FROM users WHERE email = $1 OR phone = $2 OR username = $3",
        [email, phone, username]
    );

    if (existingUser.rows.length > 0) {
        return res.status(409).json({
            success: false,
            error: { code: "AUTH_005", message: "User with this email, phone, or username already exists" }
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
        `INSERT INTO users (name, email, phone, password, username, role, kyc_status, wallet_balance, created_at)
         VALUES ($1, $2, $3, $4, $5, 'USER', 'PENDING', 0, NOW())
         RETURNING id, name, email, phone, username, role`,
        [name, email, phone, hashedPassword, username]
    );

    const newUser = result.rows[0];

    // ── Emit Kafka Notification Event
    const { emitEvent, TOPICS } = await import("../../../lib/kafka");
    await emitEvent(TOPICS.NOTIFICATION_DISPATCH, {
        user_id: newUser.id,
        event_type: "WELCOME_USER",
        channels: ["SMS", "EMAIL"],
        payload: {
            name: newUser.name || "User",
        }
    });

    return res.status(201).json({
        success: true,
        data: {
            message: "User registered successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
            }
        }
    });
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
        return res.status(400).json({
            success: false,
            error: { code: "AUTH_001", message: "Email or phone and password are required" }
        });
    }

    const result = await pool.query(
        "SELECT id, name, email, phone, password, role FROM users WHERE email = $1 OR phone = $2",
        [email ?? null, phone ?? null]
    );

    const user = result.rows[0];

    if (!user) {
        return res.status(401).json({
            success: false,
            error: { code: "AUTH_006", message: "Invalid credentials" }
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            error: { code: "AUTH_006", message: "Invalid credentials" }
        });
    }

    const secret = process.env.JWT_SECRET!;

    const accessToken = jwt.sign(
        { userId: user.id, phone: user.phone, role: user.role },
        secret,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { userId: user.id },
        secret,
        { expiresIn: "7d" }
    );

    return res.status(200).json({
        success: true,
        data: {
            message: "Login successful",
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: 900,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            }
        }
    });
});

export { registerUser, loginUser };
