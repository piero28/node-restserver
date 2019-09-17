const express = require('express');
const fileSystem = require('fs');
const path = require('path');
const {verificaTokenImg} = require('../middlewares/autenticacion');

const app = express();

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    if(fileSystem.existsSync(pathImagen)){
        res.sendFile(pathImagen);
    }else{
        let notImg = path.resolve(__dirname,'../assets/no-image.jpg');
        res.sendFile(notImg);
    }
});

module.exports = app;