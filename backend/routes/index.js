//this is where i am going to define all the routes for the backend
import express from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/user.js';
import { investmentEntities } from '../models/entities.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

rourter.get('/', auth, (req, res) => {
    res.send('API is running...');
});

//endpoint to get all the investment entities registered by this specific user
router.get('/entities', auth, async (req, res) => {
    try {
        const user = await User.find({ userId: req.user._id });
        res.json(user.portfolio);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Register for a inestment entity
router.post('/:id/register', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        // Check if user is already registered
        const isRegistered = user.portfolio.entity.some(
            entity => entity.title.toString() === req.entityTitle.toString()
        );

        if (isRegistered) {
            return res.status(400).json({ message: 'Already registered for this investment Entity' });
        }
        user.portfolio.push({
            entity: req.params.id,
            quantity: req.body.quantity,
            investmentDate: Date.now()

        });
        await user.save();

        // Adding the user to the investment entity who has bought this entity 
        await investmentEntities.findByIdAndUpdate(req.params._id, {
            $push: { peopleWhoBoughtThisEntity: user._id }
        });

        res.json({ message: 'Successfully registered for event' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Unregister from an investment entity
router.delete('/:id/register', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Remove the specific investment entity from the user's portfolio
        user.portfolio = user.portfolio.filter(
            (item) => item.entity.toString() !== req.params.id
        );

        await user.save();

        // Remove event from user's registered events
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { portfolio: entity._id }
        });

        res.json({ message: 'Successfully unregistered from event' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router;