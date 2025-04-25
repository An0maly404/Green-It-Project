/*
POST /api/user/create
POST /api/user/update

POST /api/login

POST /api/{id}/score
GET  /api/{id}/score
*/

import express from "express";

const app = express()
const PORT = 1234

app.use((req, res, next) => {
    console.log('%s %s', req.method, req.url)
    next()
})

app.listen(PORT, () => {
    console.log(`Listening on localhost:${PORT}`)
})

app.post("/api/user/create", async (req, res) => {
    const { email, pwd } = req.body

    
})
app.post("/api/user/update", async (req, res) => {})

app.post("/api/login", async (req, res) => {})

app.post("/api/{id}/score", async (req, res) => {})
app.get("/api/{id}/score", async (req, res) => {})