const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');

// Get all users
router.get(`/`, async (req, res) => {
    try {
        const userList = await User.find().select('-passwordHash');
        if (!userList) {
            return res.status(500).json({ success: false, message: 'No users found' });
        }
        res.status(200).send(userList);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/:id', async(req,res)=>{
    const user = await (await User.findById(req.params.id)).select('-passwordHash');

    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(user);
})

// Create a new user
router.post('/', async (req, res) => {
    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });

        }

        // Create new user
        let user = new User({
            name: req.body.name,
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 10),
            isAdmin: req.body.isAdmin || false,
        });

        user = await user.save();

        if (!user) {
            return res.status(400).send('The user cannot be created!');
        }

        res.status(201).send(user);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
//to login user with valid email
router.post('/login',async(req,res)=>{
    const user=await User.findOne({email:req.body.email})
    const secret=process.env.secret;
    if(!user){
        return res.status(400).json({ message: 'The user was not found!' });

    }

//to compare if entered password is correct
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
      const token=jwt.sign(
        {
            userId: user.id
        },
        secret,
        {expiresIn:'1d'}
      )
      
        res.status(200).send({user: user.email, token:token})
    }else{
        return res.status(400).json({ message: 'Incorrect password. Please try again!' });

    }

})

module.exports = router;
