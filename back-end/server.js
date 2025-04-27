/*
[x] POST /api/user/create
[x] POST /api/user/update
[x] POST /api/user/delete

[x] GET /api/users

[x] POST /api/login

[x] POST /api/{id}/score
[x] GET  /api/{id}/score
*/

import express from "express";
import cors from "cors";              // ← importer cors
import crypto from 'crypto'
import jwtpkg from 'node-jsonwebtoken';
const { sign, verify } = jwtpkg;

import {
  addNewUser,
  getPassword,
  addNewScore,
  getScoresFromID,
  getUsers,
  updateUser,
  deleteUser
} from "./auth.js"

const app = express()
const PORT = 1234

app.use(cors())
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

app.post("/api/user/update", async (req, res) => {
    const { username, password } = req.body
    const user_token = req.headers.authorization

    if (!user_token) {
        sendError(res, 400, "You are not logged in.")
        return
    }

    if (!username && !password) {
        sendError(res, 400, "At least one field should be filled out.")
        return
    }

    let hashedpassword = ""
    if (password) {
        if (password.length < 8) {
            sendError(res, 400, "Password should be 8 characters or more.")
            return
        }
        
        let hashedpassword = crypto.createHash('sha256').update(password).digest('hex')
    }

    const user_id = verify(user_token, "ILoveGreenIT<3").user_id
    let r

    await updateUser(user_id, username, hashedpassword)
        .then((result) => {
            r = true
        }).catch((err) => {
            sendError(res, 500, err)
            return
        });

    if (!r) return

    res.status(200).send({
        'message': "User has been updated"
    })
})

app.post("/api/user/delete", async (req, res) => {
    const user_token = req.headers.authorization

    if (!user_token) {
        sendError(res, 400, "You are not logged in.")
        return
    }

    const user_id = verify(user_token, "ILoveGreenIT<3").user_id
    let r

    await deleteUser(user_id)
        .then((result) => {
            r = true
        }).catch((err) => {
            sendError(res, 500, err)
            return
        });

    if (!r) return

    res.status(200).send({
        "message": "User has been deleted."
    })
})

app.get("/api/users", async (req, res) => {
    let users

    await getUsers()
        .then((result) => {
            users = result
        }).catch((err) => {
            sendError(res, 500, err)
        });

    res.status(200).send({
        "users": users
    })
})

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

app.post("/api/score", async (req, res) => {
    const { score } = req.body
    const user_token = req.headers.authorization
    
    if (!score) {
        sendError(res, 400, "Missing score field.")
        return
    }

    if (!user_token) {
        sendError(res, 400, "You are not logged in.")
        return
    }

    let user_id = verify(user_token, "ILoveGreenIT<3").user_id
    let score_id

    await addNewScore(user_id, score)
        .then((result) => {
            score_id = result
        }).catch((err) => {
            sendError(res, 500, err)
        });

    if (score_id === undefined) return

    res.status(201).send({
        "message": "Score has been added",
        "id": score_id
    })
})

app.get("/api/:id/score", async (req, res) => {
    const { id } = req.params

    if (id <= 0) {
        sendError(res, 403, "ID can't be zero or negative.")
        return
    }

    let scores

    await getScoresFromID(id)
        .then((result) => {
            scores = result
        }).catch((err) => {
            sendError(res, 500, err)
        });

    res.status(200).send({
        "scores": scores
    })
})

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

app.get('/', (req, res) => {
    res.sendFile(__dirname + '../frontend/pages/main_login.html');
});