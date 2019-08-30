//Definir Puerto
process.env.PORT = process.env.PORT || 3000;
//Definir Entorno
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
//Vencimiento Token
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;
//SEED o FIRMA Token - authentication
// ** Crear variable de entorno en HEROKU con - heroku config para listarlas
// ** Crear heroku config:set SEED="secret-prod" 
process.env.SEED = process.env.SEED || 'secret-desa';
//Base de datos
let urlDB;
if(process.env.NODE_ENV === 'dev'){
    urlDB = 'mongodb://localhost:27017/cafe';
}else{
    urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;

