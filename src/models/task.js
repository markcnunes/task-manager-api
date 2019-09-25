const mongoose = require('mongoose');
const validator = require('validator');

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
},
{
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

// const task = new Task({
//     description: 'Learn jQuery library    ',
// });

// task.save().then(() => {
//     console.log(task);
// }).catch((error) => {
//     console.log('Error!', error);
// });

module.exports = Task;