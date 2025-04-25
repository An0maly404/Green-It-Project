/*
[x] POST /api/user/create
[ ] POST /api/user/update

[ ] POST /api/login

[ ] POST /api/{id}/score
[ ] GET  /api/{id}/score
*/

import express from "express";
import crypto from 'crypto'
import jwtpkg from 'node-jsonwebtoken';
const { sign, verify } = jwtpkg;


import {
    addNewUser,
    getPassword
} from "./routes/auth.js"


const app = express()
const PORT = 1234

app.use(express.json());
app.use((req, res, next) => {
    console.log('%s %s', req.method, req.url)
    next()
})

app.listen(PORT, () => {
    console.log(`Listening on localhost:${PORT}`)
})

app.post("/api/user/create", async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        sendError(res, 400, "Missing username and/or password field.")
        return
    }

    if (password.length < 8) {
        sendError(res, 400, "Password should be 8 characters or more")
        return
    }

    let hashedpassword = crypto.createHash('sha256').update(password).digest('hex')
    let user_id = undefined

    await addNewUser(username, hashedpassword)
    .then((result) => {
        user_id = result
    }).catch((err) => {    
        sendError(res, 500, err)
    });

    if (user_id === undefined) return

    const token = generateToken(user_id);

    res.status(201).send({
        "message": "New user created",
        "token": token
    })
})

app.post("/api/user/update", async (req, res) => {})

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        sendError(res, 400, "Missing username and/or password field.")
        return
    }

    let hashedpwd = crypto.createHash('sha256').update(password).digest('hex')
    let passwordFromDB

    await getPassword(username)
    .then((result) => {
        passwordFromDB = result
    }).catch((err) => {    
        sendError(res, 500, err)
    });

    if (passwordFromDB === undefined) return;
    if (passwordFromDB === null) return;

    if (passwordFromDB.password !== hashedpwd) {
        sendError(res, 403, "Wrong login information.")
        return
    }

    const token = generateToken(passwordFromDB.id);

    res.status(200).send({
        "token": token
    })
})

app.post("/api/:id/score", async (req, res) => {})
app.get("/api/:id/score", async (req, res) => {})

function sendError(res, statuscode, error) {
    res.status(statuscode).send({
        "message": "" + error
    })
}

function generateToken(user_id) {
    let jwtSecretKey = "ILoveGreenIT<3"

    let data = {
        time: Date(),
        user_id: user_id,
    }

    return sign(data, jwtSecretKey, { expiresIn: '24h' })
}