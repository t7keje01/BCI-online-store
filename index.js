const { v4: uuidv4 } = require('uuid');
const express = require('express');
const passport = require('passport');1
const BasicStrategy = require('passport-http').BasicStrategy;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const secrets = require('./secret-keys-stash.json');
const app = express();
const port = 3000;

const products = [
    {
        "id": uuidv4(),
        "title": "Red bicycle for sale",
        "description": "I'm selling a 1-year old bicycle that has been hardly used.",
        "category": "Vehicles",
        "location": "Rovaniemi",
        "images": "string",
        "askingPrice": 500,
        "postingDate": "22.01.2022",
        "deliveryType": {
          "shipping": false,
          "pickup": true
        },
        "sellerName": "bicycleboy",
        "sellerNumber": "0401234567"
      },
      {
        "id": uuidv4(),
        "title": "Hand knitted mittens for sale",
        "description": "Mittens I've knitted myself, multiple color options",
        "category": "Handicraft",
        "location": "Ivalo",
        "images": "string",
        "askingPrice": 30,
        "postingDate": "12.01.2022",
        "deliveryType": {
          "shipping": true,
          "pickup": true
        },
        "sellerName": "neighborhoodgranny",
        "sellerNumber": "0407654321"
      }
];

const users = [];

app.use(bodyParser.json());

passport.use(new BasicStrategy(
    function(username, password, done) {
        let user = users.find(user => (user.username === username) && (bcrypt.compareSync(password, user.password)));
        if (user != undefined) {
            done(null, user);
        }
        else {
            done(null, false);
        }
    }
));

const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const jwtOpts = {}
jwtOpts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOpts.secretOrKey = secrets.jwtSignKey;

passport.use(new JwtStrategy(jwtOpts, function(jwt_payload, done) {
    
    const user = users.find(u => u.username === jwt_payload.user );
    done(null, user);

}));

app.post('/users', (req, res) => {
    const salt = bcrypt.genSaltSync(6);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const user = {
        id: uuidv4(),
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email
    }

    users.push(user);
    res.sendStatus(201);
})

app.post('/login', passport.authenticate('basic', { session: false }), (req, res) => {
   
    const payloadData = {
        user: req.user.username
    };
    
    const options = {
        expiresIn: '12h'
    }

    const token = jwt.sign(payloadData, secrets.jwtSignKey, options);

    res.json({ token: token });
})

app.get('/products', (req, res) => {

    const category = req.params.category;
    const location = req.params.location;
    const postingDate = req.params.postingDate;

    for (let product of products) {
        if (product.category === category) {
            res.json(product);
            return;
        }
        else if (product.location === location) {
            res.json(product);
            return;
        }
        else if (product.postingDate === postingDate) {
            res.json(prodect);
            return;
        }
        else {
            res.status(404)
        }
    }
})

app.post('/products', passport.authenticate('jwt', { session: false }), (req, res) => {
    
})

app.put('/products/:productId', passport.authenticate('jwt', { session: false }), (req, res) => {
    let foundProduct = products.find(t => t.id === req.params.productId);

    if(foundProduct) {
        foundProduct.title = req.body.title;
        foundProduct.description = req.body.description;
        foundProduct.category = req.body.category;
        foundProduct.location = req.body.location;
        foundProduct.images = req.body.images;
        foundProduct.askingPrice = req.body.askingPrice;
        foundProduct.postingDate = req.body.postingDate;
        foundProduct.deliveryType.shipping = req.body.deliveryType.shipping;
        foundProduct.deliveryType.pickup = req.body.deliveryType.pickup;
        foundProduct.sellerName = req.body.sellerName;
        foundProduct.sellerNumber = req.body.sellerNumber;
        res.sendStatus(202);
    }
    else {
        res.sendStatus(404);
    }

})

app.delete('/products/:productId', passport.authenticate('jwt', { session: false }), (req, res) => {
    let foundIndex = products.findIndex(t => t.id === req.params.productId);
    
    if(foundIndex === -1) {
        res.sendStatus(400);
    } else {
        todos.splice(foundIndex, 1);
        res.sendStatus(202);
    }
})

app.listen(port, () => {
    console.log(`Example app listening on post ${port}`)
})
