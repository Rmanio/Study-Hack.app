const express = require('express');
const route = express.Router()

const services = require('../services/render');
const controller = require('../controller/controller');
const {ensureAuthenticated} = require("../../config/auth");


route.get('/', ensureAuthenticated, services.homeRoutes);


route.get('/add-user', ensureAuthenticated, services.add_user)

route.get('/update-user', ensureAuthenticated, services.update_user)

// API
route.post('/api/users', controller.create);
route.get('/api/users', controller.find);
route.put('/api/users/:id', controller.update);
route.delete('/api/users/:id', controller.delete);


module.exports = route