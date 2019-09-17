const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fileSystem = require('fs');
const path = require('path');

//Opciones default - crea variable file donde se alojan los archivos a subir
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', function(req, res){
    let tipo = req.params.tipo;
    let id = req.params.id;
    if(!req.files){
        return res.status(412).json({
            success: false,
            err: {
                message: 'No existe archivo de subida'
            }
        });
    }
    //Validar tipos
    let tipos = ['productos','usuarios'];
    if(tipos.indexOf(tipo) < 0){
        return res.status(412).json({
            success: false,
            err:{
                message: 'Los tipos permitidos son ' + tipos.join(', '), //join permite mostrar el array dividido por caracteres descrito
                ext: tipo
            }
        }); 
    }
    let archivo = req.files.archivo;
    //Validar extensiones archivo
    let extensiones = ['png','jpg','gif','jpeg'];
    let nombreArchivo = archivo.name.split('.');
    let extension = nombreArchivo[nombreArchivo.length -1];
    if(extensiones.indexOf(extension) < 0){
        return res.status(412).json({
            success: false,
            err:{
                message: 'Las extensiones permitidas son ' + extensiones.join(', '), //join permite mostrar el array dividido por caracteres descrito
                ext: extension
            }
        });
    }
    //Cambiar nombre archivo Unico
    let nombreArchivoUnico = `${id}-${new Date().getMilliseconds()}.${extension}`;
    //Deja archivo de entrada en la carpeta descrita - definiendo el nombre con template literal ``
    archivo.mv(`../uploads/${tipo}/${nombreArchivoUnico}`, (err) => {
        if(err){
            return res.status(500).json({
                success: false,
                err
            });
        }
        if(tipo === 'usuarios'){
            imagenUsuario(id, res, nombreArchivoUnico);
        }else{
            imagenProducto(id, res, nombreArchivoUnico);
        }
    });
});

function imagenUsuario(id, res, nombreArchivoUnico){
    Usuario.findById(id, (err, usuarioBD) => {
        if(err){
            borrarArchivo(nombreArchivoUnico, 'usuarios');
            return res.json({
                success: false,
                err
            });
        }
        if(!usuarioBD){
            borrarArchivo(nombreArchivoUnico, 'usuarios');
            return res.status(400).json({
                success: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }
        borrarArchivo(usuarioBD.img, 'usuarios');
        usuarioBD.img = nombreArchivoUnico;
        usuarioBD.save((err, usuarioGuardado) => {
            res.json({
                success: true,
                usuario: usuarioGuardado,
                img: nombreArchivoUnico
            });
        });
    });
}

function imagenProducto(id, res, nombreArchivoUnico){
    Producto.findById(id, (err, productoBD) => {
        if(err){
            borrarArchivo(nombreArchivoUnico, 'productos');
            return res.json({
                success: false,
                err
            });
        }
        if(!productoBD){
            borrarArchivo(nombreArchivoUnico, 'productos');
            return res.status(400).json({
                success: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }
        borrarArchivo(productoBD.img, 'productos');
        productoBD.img = nombreArchivoUnico;
        productoBD.save((err, productoGuardado) => {
            res.json({
                success: true,
                producto: productoGuardado,
                img: nombreArchivoUnico
            });
        });
    });
}

function borrarArchivo(nombreImagen, tipo){
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    //Confirmar Path si existe
    if(fileSystem.existsSync(pathImagen)){
        //Eliminar archivo
        fileSystem.unlinkSync(pathImagen);
    }
}

module.exports = app;
