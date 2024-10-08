const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcryptjs');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const pgdb = knex({
    client: 'pg',
    connection: {
        host: process.env.PGDB_HOST,
        port: 5432,
        user: process.env.PGDB_UN,
        password: process.env.PGDB_PW,
        database: process.env.PGDB_DB,
    },
});

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://smart-brain-aj3m.onrender.com');
    // res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200); // You can return 204 if you don't want content
    } else {
        next();
    }
});

// const corsOptions = {
//     origin: 'https://smart-brain-aj3m.onrender.com',
//     optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));
// app.options('*', cors(corsOptions)); // Preflight request handling

const returnClarifyRequestOption = (imageUrl) => {
    const PAT = '5fd4f01917e4476db56ac969e094c0da';
    const USER_ID = 'strykefreedom08';
    const APP_ID = 'face_recognition_brain';
    const IMAGE_URL = imageUrl;

    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": IMAGE_URL
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };

    return requestOptions;
}

app.get('/', (req, res) => res.send('Initially loaded successfully.'))
app.post('/signin', signin.handleSignIn(pgdb, bcrypt))
app.post('/register', register.handleRegister(pgdb, bcrypt))
app.get('/profile/:id', profile.handleProfile(pgdb))
app.put('/image', image.handleImage(pgdb, returnClarifyRequestOption))
app.listen(3000, () => console.log('app is running on port 3000'))