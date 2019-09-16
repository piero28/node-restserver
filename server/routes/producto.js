const express = require('express');
const { verificarToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

//Obtener los productos - usuario - categoria - paginado.
app.get('/producto', verificarToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let hasta = req.query.hasta || 100;
    hasta = Number(hasta);
    Producto.find({disponible:true})
    .sort('nombre')
    .populate('categoria', 'descripcion')
    .populate('usuario', 'nombre email')
    .skip(desde)
    .limit(hasta)
    .exec((err, productos) => {
        if(err){
            res.json({
                success: false,
                err
            });
        };
        Producto.count((err, conteo) => {
            res.json({
                success: true,
                productos: productos,
                totalRegistros: conteo
            });
        });
    });
});

//Obtener producto por id
app.get('/producto/:id', verificarToken, (req, res) => {
    let id = req.params.id;
    Producto.findById(id)
    .populate('categoria', 'descripcion')
    .populate('usuario', 'nombre email')
    .exec((err, producto) => {
        if(err){
            return res.status(500).json({
                success: false,
                err
            });
        }
        if(!producto){
            return res.status(204).json({
                success: false,
                message: 'El id no es correcto'
            });
        }
        res.json({
            success: true,
            producto
        });
    });
});

//Crear producto - grabar usuario, categoria
app.post('/producto', verificarToken, (req, res) => {
    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id 
    });
    producto.save((err, productoDB) => {
        if(err){
            return res.status(500).json({
                success: false,
                err
            });
        }
        if(!productoDB){
            return res.status(400).json({
                success: false,
                err
            });
        }
        res.status(201).json({
            success: true,
            producto: productoDB
        });
    });
});

//Actualizar producto por id
app.put('/producto/:id', verificarToken, (req, res) => {
    let body = req.body;
    let id = req.params.id;
    Producto.findById(id, (err, productoDB) => {
        if(err){
            return res.status(400).json({
                success: false,
                err
            });
        }
        if(!productoDB){
            return res.status(400).json({
                success: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }
        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.descripcion = body.descripcion;
        productoDB.disponible = body.disponible;
        productoDB.categoria = body.categoria;
        productoDB.save((err, productoGuardado) => {
            if(err){
                return res.status(500).json({
                    success: false,
                    err
                });
            }
            res.status(201).json({
                success: true,
                producto: productoGuardado
            });
        });
    });
});

//Eliminar un producto - logicamente 
app.delete('/producto/:id', verificarToken, (req, res) => {
    let id = req.params.id;
    Producto.findById(id, (err, productoDB) => {
        if(err){
            return res.status(500).json({
                success: false,
                err
            });
        };
        if(!productoDB){
            return res.status(400).json({
                success: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }
        productoDB.disponible = false;
        productoDB.save((err, productoGuardado) => {
            if(err){
                return res.status(500).json({
                    success: false,
                    err
                });
            }
            res.status(201).json({
                success: true,
                producto: productoGuardado,
                message: 'Producto borrado'
            });
        });
    });
});

//Buscar productos
app.get('/producto/find/:termino', verificarToken, (req, res) => {
    let termino = req.params.termino;
    //Crear expresion regular con el termino, configurando que sea insensible a mayus o minus con "i"
    let regex = new RegExp(termino, 'i');
    Producto.find({nombre: regex})
    .populate('categoria', 'nombre')
    .exec((err, productos) => {
        if(err){
            return res.status(500).json({
                success: false,
                err
            });
        }
        res.json({
            success: true,
            productos
        });
    });
});

module.exports = app;

