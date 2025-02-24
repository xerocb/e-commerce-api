const express = require('express');
const query = require('../db/index');

const router = express.Router();

router.post('/', async (req, res, next) => {
    try {
        // Get data from body
        const { email, password, firstName, lastName } = req.body;

        // Check if email already in use
        const emailInUseQuery = await query(
            `SELECT *
            FROM users
            WHERE email=$1`,
            [email]
        );

        const emailInUse = emailInUseQuery.rows?.length > 0;

        if (emailInUse) {
            res.status(409).send('Email is already in use.');
        } else {
            // Add user
            const addUserQuery = await query(
                `INSERT INTO users
                (email, password, first_name, last_name)
                VALUES
                ($1, $2, $3, $4)
                RETURNING *`,
                [email, password, firstName, lastName]
            );

            res.status(201).send(`User added with ID: ${addUserQuery.rows[0].id}`);
        }
    } catch(err) {
        next(err);
    }
})

module.exports = router;