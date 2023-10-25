const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Game title is required']
    },
    description: {
        type: String,
        required: [true, 'Game description is required']
    },
    genres: {
        type: String,
        required: [true, 'Game genres is required']
      },
    platforms: {
        type: String,
        required: [true, 'Game platforms is required']
    },
    release_date: {
        type: String,
        required: [true, 'Game release date is required']
    },
    main_photo: {
        url: {
            type: String,
            required:  [true, 'Image URL is required'] 
        },
        filename: {
            type: String,
            required:  [true, 'File name is required'] 
        }
    },
    cover_photo: {
        url: {
            type: String,
            required:  [true, 'Image URL is required'] 
        },
        filename: {
            type: String,
            required:  [true, 'File name is required'] 
        }
    },
    systemRequirements: [
        {
            type: {
                type: String,
                enum: ["Minimum", "Recommended"],
                required: true
            },
            os: {
                type: String,
                required: [true, 'Operating System is required']
            },
            processor: {
                type: String,
                required: [true, 'Processor information is required']
            },
            memory: {
                type: String,
                required: [true, 'Memory information is required']
            },
            graphics: {
                type: String,
                required: [true, 'Graphics information is required']
            }
        }
    ]
}, {timestamps: true})

module.exports = mongoose.model('Game', gameSchema)