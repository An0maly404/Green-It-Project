import express from "express";
import cors from "cors";
import crypto from 'crypto';
import jwtpkg from 'node-jsonwebtoken';
import {
  addNewUser,
  getPassword,
  addNewScore,
  getScoresFromID,
  getUsers,
  updateUser,
  deleteUser,
  createAdminIfNotExists
} from "./auth.js";

const { sign, verify } = jwtpkg;
const app = express();
const PORT = 1234;

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log('%s %s', req.method, req.url);
    next();
});

createAdminIfNotExists();

app.listen(PORT, () => {
    console.log(`Listening on localhost:${PORT}`);
});

function sendError(res, status, msg) {
    res.status(status).send({ message: msg });
}

function generateToken(id, username, role) {
    return sign({ time: Date(), user_id: id, username, role }, "ILoveGreenIT<3", { expiresIn: '24h' });
}

app.post("/api/user/create", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return sendError(res, 400, "Missing fields");
    if (password.length < 8) return sendError(res, 400, "Password too short");

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    try {
        const id = await addNewUser(username, hash);
        const token = generateToken(id, username, 'user');
        res.status(201).send({ message: "New user created", token });
    } catch (e) {
        sendError(res, 500, e.message);
    }
});

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return sendError(res, 400, "Missing fields");

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    let user;
    try {
        user = await getPassword(username);
    } catch (e) {
        return sendError(res, 403, "Wrong login information.");
    }
    if (user.password !== hash) return sendError(res, 403, "Wrong login information.");

    const token = generateToken(user.id, username, user.role);
    res.send({ token });
});

app.get("/api/users", async (req, res) => {
    try {
        const users = await getUsers();
        res.send({ users });
    } catch (e) {
        sendError(res, 500, e.message);
    }
});

app.post("/api/user/update", async (req, res) => {
    const token = req.headers.authorization;
    if (!token) return sendError(res, 400, "Not logged in.");

    const { username, password, user_id } = req.body;
    if (!username && !password) return sendError(res, 400, "No fields to update.");

    console.log(username, password)

    // const { user_id } = verify(token, "ILoveGreenIT<3");
    if (user_id === 1) return sendError(res, 500, "Can't update admin.");

    const hash = password
        ? crypto.createHash('sha256').update(password).digest('hex')
        : undefined;

    try {
        await updateUser(user_id, username || undefined, hash || undefined);
        res.send({ message: "User updated" });
    } catch (e) {
        sendError(res, 500, e.message);
    }
});

app.post("/api/user/delete", async (req, res) => {
    const token = req.headers.authorization;
    if (!token) return sendError(res, 400, "Not logged in.");

    const { user_id } = req.body;
    // const { user_id } = verify(token, "ILoveGreenIT<3");

    if (user_id === 1) return sendError(res, 500, "Can't delete admin.");

    try {
        await deleteUser(user_id);
        res.send({ message: "User deleted." });
    } catch (e) {
        sendError(res, 500, e.message);
    }
});

app.post("/api/score", async (req, res) => {
    const token = req.headers.authorization;
    const { score } = req.body;
    if (!token) return sendError(res, 400, "Not logged in.");
    if (score == null) return sendError(res, 400, "Missing score.");

    const { user_id } = verify(token, "ILoveGreenIT<3");
    try {
        const id = await addNewScore(user_id, score);
        res.status(201).send({ message: "Score added", id });
    } catch (e) {
        sendError(res, 500, e.message);
    }
});

app.get("/api/:id/score", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return sendError(res, 400, "Invalid ID.");

    try {
        const scores = await getScoresFromID(id);
        res.send({ scores });
    } catch (e) {
        sendError(res, 500, e.message);
    }
});
