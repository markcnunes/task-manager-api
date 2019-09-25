const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: 'String',
        index: true, unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Pssword can not contain the word "Password"');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number.');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},
{
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to login');
    }

    const isMAtch = await bcrypt.compare(password, user.password);

    if (!isMAtch) {
        throw new Error('Unable to login');
    }

    return user
};

// Hash the play text password before saving
userSchema.pre('save', async function (next) {
    const user = this;

    // this.schema.path('email').validate(function (value, respond) {                                                                                           
    //     this.findOne({ email: value }, function (err, user) {                                                                                                
    //         if(user) {
    //             respond(false);                                                                                                                         
                
    //         } else {
    //             respond(true);
    //         }
    //     });                                                                                                                                                  
    // }, 'This email address is already registered');

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});




// const me = new User({
//     name: '  Joao',
//     email: '  TEST@test.COM  ',
//     password: ' newO123do '
// });

// me.save().then(() => {
//     console.log(me);
// }).catch((error) => {
//     console.log('Error!', error);
// });

// Delete User tasks when user is removed

userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
});

// userSchema.index({ username: 1, email: 1 }, { unique: true});
const User = mongoose.model('User', userSchema);

module.exports = User;