const express = require('express');
const { verificarToken, verificaAdminRole } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

//Mostrar las categorias
app.get('/categoria', verificarToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let hasta = req.query.hasta || 10;
    hasta = Number(hasta);
    Categoria.find({})
    .sort('descripcion') //Ordenar categorias
    .populate('usuario', 'nombre email') //Obtiene y muestra la info del id relacionado de la tabla usuario
    .skip(desde)
    .limit(hasta)
    .exec((err, categorias) => {
        if(err){
            res.json({
                success: false,
                err
            });
        }
        Categoria.count((err, conteo) => {
            res.json({
                success: true,
                categoria: categorias,
                totalRegistros: conteo
            });
        });
    });
});

// Mostrar una categoria por ID
app.get('/categoria/:id', verificarToken, (req, res) => {
    let id = req.params.id;
    Categoria.findById(id, (err, categoria) => {
        if(err){
            res.json({
                success: false,
                err
            });
        }
        if(!categoria){
            return res.status(204).json({
                success: false,
                message: 'El id no es correcto'
            });
        }
        res.json({
            success: true,
            categoria
        });
    });
});

//Crear una categoria
app.post('/categoria', verificarToken, (req, res) => {
    let body = req.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    categoria.save((err, categoriaDB) => {
        if(err){
            return res.status(400).json({
                success: false,
                err
            });
        }
        if(!categoriaDB){
            return res.status(400).json({
                success: false,
                err
            });
        }
        res.json({
            success: true,
            categoria: categoriaDB
        });
    });
});

//Actualizar una categoria
app.put('/categoria/:id', verificarToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let descCategoria = {
        descripcion: body.descripcion
    }
    Categoria.findByIdAndUpdate(id, descCategoria, {new: true, runValidators: true, context: 'query'}, (err, categoriaDB) => {
        if(err){
            return res.status(400).json({
                success: false,
                err
            });
        }
        if(!categoriaDB){
            return res.status(400).json({
                success: false,
                err
            });
        }
        res.json({
            success: true,
            categoria: categoriaDB
        });
    });
});

//Eliminar una categoria
app.delete('/categoria/:id', [verificarToken, verificaAdminRole], (req, res) => {
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if(err){
            return res.status(500).json({
                success: false,
                err
            });
        };
        if(!categoriaBorrada){
            return res.status(400).json({
                success: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }
        res.json({
            success: true,
            message: 'Categoria Borrada'
        });
    });
});

module.exports = app;