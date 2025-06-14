const express = require('express');
const ToDo = require('../schemas/ToDo');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../schemas/User');
const jwt=require('jsonwebtoken');

router.post('/register', async (req, res) => {

    const data = req.body;

    if (!data.email && !data.password)
        return res.json('Email ve Şifre Boş Olamaz!').status(400);

    const user = new User(data);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt); //şifre hashleme
    const createdUser = await user.save();

    res.status(201).json({
        id: createdUser._id,
        email: createdUser.email,
        password: createdUser.password,
        token:createdUser.token
    });



});


router.post('/login', async (req, res, next) => {

    try {
        const data = req.body;

    if (!data.email && !data.password)
        return res.json({message: 'Email ve şifre boş olamaz!',status: 400});

    const user = await User.findOne({email: data.email});
    if(!user ) return res.json(({message: 'Kullanıcı bulunamadı!',status: 404}));

    const validPassword =await bcrypt.compare(data.password, user.password);

    if(!validPassword){
        return next(res.json({message: 'Email veya şifre hatalı!',status: 400}));
    }

    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY, { expiresIn: '1h' });
    res.header('token',token);
    
    return res.json({data:{message: 'Kullanıcı başarıyla giriş yaptı.',
         access_token: token},
         status: 200});


    } catch (error) {
        res.json({
            message: error.message,
            status:500,

        }).status(500);
    }

});

module.exports = router;