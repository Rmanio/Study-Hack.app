const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');


//User model
const User = require('../models/User');

//Login Page
router.get('/login', (req, res) => res.render('login'));

//Register Page
router.get('/register', (req, res) => res.render('register'));

//Register Handle
router.post('/register', (req, res) => {
    const {name, surname, email, password, password2} = req.body;
    let errors = [];

    //Check required fields
    if (!name || !surname || !email || !password || !password2) {
        errors.push({ msg: 'Please, fill in all fields' });
    }

    //Email Domain
    const domains = ['.ru', '.kz', '.co', '.uk', '.de', '.au', '.com', '.org', '.edu', '.net'];
    if (email){
        if (domains.includes(email.slice(email.length - 3, email.length))){}
        else if (domains.includes(email.slice(email.length - 4, email.length))){}
        else {errors.push({ msg: 'Email\'s domain isn\'t correct' });}
    }


    //---------Password-------------------------
    //Check passwords match
    if (((password2.length > 0)) && (password !== password2)) {
        errors.push({ msg: 'Passwords do not match' });
    }
    //Complexity of pass
    let isSmall = false, isCapital = false, isSpecial = false, isNumber = false;
    for (let i = 0; i < password.length; i++){
        if (password.charCodeAt(i) >= 97 && password.charCodeAt(i) <= 122)
            isSmall = true;
        if (password.charCodeAt(i) >= 65 && password.charCodeAt(i) <= 90)
            isCapital = true;
        if (password.charCodeAt(i) >= 48 && password.charCodeAt(i) <= 57)
            isNumber = true;
        if (password.charCodeAt(i) === 46 || password.charCodeAt(i) === 95)
            isSpecial = true;
    }
    let isPasswordSafe = (isSmall && isCapital && isSpecial && isNumber);
    if ((password.length > 0) && (isPasswordSafe !== true)) {
        errors.push({msg: 'Password must contain: digits(0-9), a-z, A-Z, "." or "_" '});
    }

    //Password's last character
    if ((password.length > 0) && (password.charCodeAt(password.length) === (46 || 95))){
        errors.push({msg: 'The last character must be a digit or letter'});
    }

    //Check pass length
    if ((password.length > 0) && (password.length < 7)) {
        if (password.length === 0){

        } else{
            errors.push({ msg: 'Password must be at least 7 characters' });
        }
    }
    // -------------------------------------------------------
    if (errors.length > 0){
        res.render('register', {
            errors,
            name,
            surname,
            email,
            password,
            password2
        });
    } else {
        //Validation passed
        User.findOne({email: email})
            .then(user=>{
                if (user){
                    //User exists
                    errors.push({msg: 'Email is already registered'})
                    res.render('register', {
                        errors,
                        name,
                        surname,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        surname,
                        email,
                        password
                    });

                    //Hash passwords
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) =>{
                        if (err) throw err;
                        //Set password to hashed
                        newUser.password = hash;
                        //Save user
                        newUser.save()
                            .then(user => {
                                req.flash(
                                    'success_msg',
                                    'You are now registered and can log in'
                                );
                                res.redirect('/users/login');
                            })
                            .catch(err => console.log(err));
                        }))
                }
        });
    }
});

// Login
router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/users/login",
        failureFlash: true,
    }), (req, res) => {
        const {email, password} = req.body;
        if ((email !== ('anADMIN@admin.com' || 'akADMIN@admin.com' || 'dnADMIN@admin.com' || 'yzADMIN@admin.com')) && (password !== 'Aa.1234') )
       res.redirect("/main");
   else
       res.redirect("/ADMIN");
    });

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;