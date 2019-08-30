require('./config/config');

const express = require('express');
const mongoose = require('mongoose');

const app = express();

var bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
//de esta manera importamos y usamos esas rutas del usuario
//configuracion global de rutas
app.use(require('./routes/index'));

mongoose.connect('mongodb://localhost:27017/cafe', {useNewUrlParser: true}, (err, res) => {
    if(err){
        throw err;
    }
    console.log("Base de datos ONLINE!!");
});
 
app.listen(process.env.PORT, () => {
    console.log("Escuchando puerto: ", 3000);
});