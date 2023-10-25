const Game = require('../models/game.model');
const { cloudinary } = require('../utils/cloudinary');
const mongoose = require('mongoose');
const HandleError = require('../utils/HandleError');

module.exports.createGame = async (req, res, next) => {
    try{
        const { title, platforms, releaseDate, about_this_game, 
                genres, min_os, min_processor, min_memory,
                min_graphics_card,max_os,max_processor,max_memory,
                max_graphics_card,
                } = req.body;
        const minSystemRequirements = {
            type: 'Minimum',
            os: min_os.trim(),
            processor: min_processor.trim(),
            memory: min_memory.trim(),
            graphics: min_graphics_card.trim(),
        };
        const maxSystemRequirements = {
            type: 'Recommended',
            os: max_os.trim(),
            processor: max_processor.trim(),
            memory: max_memory.trim(),
            graphics: max_graphics_card.trim(),

        };
        const newGame = new Game({
            title: title.trim(),
            platforms: platforms.trim(),
            release_date: releaseDate.trim(),
            description: about_this_game.trim(),
            genres: genres.trim(),
            systemRequirements: [minSystemRequirements, maxSystemRequirements],
            main_photo: { url: req.files.mainPhoto[0].path, filename: req.files.mainPhoto[0].filename },
            cover_photo: { url: req.files.coverPhoto[0].path, filename: req.files.coverPhoto[0].filename }
        })
        await newGame.save();
        res.status(200).send({succes: true})
    }catch(e){
        if (req.files && req.files.mainPhoto && req.files.coverPhoto) {
            const mainPhotoFilename = req.files.mainPhoto[0].filename;
            const coverPhotoFilename = req.files.coverPhoto[0].filename;
          
            // Delete both images from Cloudinary
            await cloudinary.uploader.destroy(mainPhotoFilename);
            await cloudinary.uploader.destroy(coverPhotoFilename);
        }
        console.log(e);
        next(e);
    }
}
module.exports.updateGame = async (req, res, next) => {
    try{
        const {id} = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) throw new HandleError(`Game not found`, 404);
        const game = await Game.findById(id)
        if(!game) throw new HandleError(`Game not found`, 404);
        const { title, platforms, releaseDate, about_this_game, 
            genres, min_os, min_processor, min_memory,
            min_graphics_card,max_os,max_processor,max_memory,
            max_graphics_card,
        } = req.body;
        const minSystemRequirements = {
            type: 'Minimum',
            os: min_os.trim(),
            processor: min_processor.trim(),
            memory: min_memory.trim(),
            graphics: min_graphics_card.trim(),
        };
        const maxSystemRequirements = {
            type: 'Recommended',
            os: max_os.trim(),
            processor: max_processor.trim(),
            memory: max_memory.trim(),
            graphics: max_graphics_card.trim(),
        };
        const updatedGame = {
            title: title.trim(),
            platforms: platforms.trim(),
            release_date: releaseDate.trim(),
            description: about_this_game.trim(),
            genres: genres.trim(),
            systemRequirements: [minSystemRequirements, maxSystemRequirements],
        }
        // delete previous images and add new ones
        if(req.files.mainPhoto) {
            await cloudinary.uploader.destroy(game.main_photo.filename);
            updatedGame.main_photo = {
                url: req.files.mainPhoto[0].path,
                filename: req.files.mainPhoto[0].filename
            };

        }
        if(req.files.coverPhoto) {
            await cloudinary.uploader.destroy(game.cover_photo.filename);
            updatedGame.cover_photo = { 
                url: req.files.coverPhoto[0].path,
                filename: req.files.coverPhoto[0].filename
            };
        }
        await game.updateOne(updatedGame);
        res.status(200).json(updatedGame);
    }catch(e){
        next(e);
    }
}
module.exports.fetchAllGames = async (req, res, next) => {
    try{
        const games = await Game.find()

        res.send(games);
    }catch(e){
        next(e);
    }
}
module.exports.fetchGameToEdit = async (req, res, next) => {
    try{
        const {id} = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) throw new HandleError(`Game not found`, 404);
        const game = await Game.findById(id)
        if(!game) throw new HandleError(`Game not found`, 404);
        res.status(200).json(game);
    }catch(e){
        next(e);
    }
}