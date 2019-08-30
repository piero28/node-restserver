const express = require('express');
const bcrypt = require('bcrypt');
const _underscore = require('underscore');
const Usuario = require('../models/usuario');
const { verificarToken, verificaAdminRole } = require('../middlewares/autenticacion');
const app = express();

  app.get('/usuario', verificarToken, function (req, res) {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);
    Usuario.find({estado:true}, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if(err){
                return res.status(400).json({
                    success: false,
                    err
                });
            }

            Usuario.count({estado:true}, (err, conteo) => {
                res.json({
                    success: true,
                    usuario: usuarios,
                    totalRegistros: conteo
                });
            })
        })
  });
  
  app.post('/usuario', [verificarToken, verificaAdminRole], function (req, res) {
      let body = req.body;
      let usuario = new Usuario({
            nombre : body.nombre,
            email: body.email,
            password: bcrypt.hashSync(body.password, 10),
            role: body.role
      });
      usuario.save((err, usuarioDB) => {
            if(err){
                return res.status(400).json({
                    success: false,
                    err
                });
            }
            res.json({
                success: true,
                usuario: usuarioDB
            });
      });
  });
  
  app.put('/usuario/:id', [verificarToken, verificaAdminRole], function (req, res) {
      let id = req.params.id;
      let body = _underscore.pick(req.body, ['nombre','email','img','role','estado']);
      Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true, context: 'query'}, (err, usuarioDB) => {
            if(err){
                return res.status(400).json({
                    success: false,
                    err
                });
            }
            res.json({
                success: true,
                usuario: usuarioDB
            });
      })
  });
  
  app.delete('/usuario/:id', [verificarToken, verificaAdminRole], function (req, res) {
      let id = req.params.id;
      let cambiaEstado = {
          estado: false
      }
      //findByIdAndRemove eliminado fisico
      //findByIdAndDelete eliminado logico
      Usuario.findByIdAndUpdate(id, cambiaEstado, {new: true}, (err, usuarioBorrado) => {
        if(err){
            return res.status(400).json({
                success: false,
                err
            });
        };
        if(!usuarioBorrado){
            return res.status(400).json({
                success: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            success: true,
            usuario: usuarioBorrado
        });
      })
  });


  module.exports = app;