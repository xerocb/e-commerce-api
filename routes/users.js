const express = require('express');
const query = require('../db/index');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const allUsersQuery = await query(
            `SELECT *
            FROM users`
        );

        res.status(200).send(allUsersQuery.rows);
    } catch(err) {
        next(err);
    }
});

router.get('/:userId', async (req, res, next) => {
    const { userId } = req.params;

    try {
        const singleUserQuery = await query(
            `SELECT *
            FROM users
            WHERE id=$1`,
            [userId]
        );

        res.status(200).send(singleUserQuery.rows[0]);
    } catch(err) {
        next(err);
    }
});

router.put('/:userId', async (req, res, next) => {
    const { userId } = req.params;
    const { email, password, firstName, lastName } = req.body;

    try {
        const updateUserQuery = await query(
            `UPDATE users
            SET email=$1,
            password=$2,
            first_name=$3,
            last_name=$4
            WHERE id=$5
            RETURNING *`,
            [email, password, firstName, lastName, userId]
        );

        res.status(200).send(`User updated with ID: ${updateUserQuery.rows[0].id}`)
    } catch(err) {
        next(err);
    }
});

module.exports = router;