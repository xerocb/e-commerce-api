const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const port = process.env.PORT;
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const query = require('./db/index');
const cors = require('cors');

const registerRouter = require('./routes/register');
const productsRouter = require('./routes/products');
const usersRouter = require('./routes/users');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');

app.use(cors());

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    done(null, { id });
});

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            // Search for user using email
            const emailInUseQuery = await query(
                `SELECT *
                FROM users
                WHERE email=$1`,
                [username]
            );

            const emailInUse = emailInUseQuery.rows?.length > 0;

            if (!emailInUse) {
                return done(null, false);
            } else {
                const user = emailInUseQuery.rows[0];
                if (user.password !== password) {
                    return done(null, false);
                } else {
                    return done(null, user);
                }
            }
        } catch (err) {
            return done(err);
        }
    }
));

app.post('/login', 
    passport.authenticate('local'),
    (req, res) => {
        res.status(200).send('Login successful');
    }
);

app.use('/register', registerRouter);
app.use('/products', productsRouter);
app.use('/users', usersRouter);
app.use('/cart', cartRouter);
app.use('/orders', ordersRouter);

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            next(err);
        }
        res.redirect('/');
    });
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});