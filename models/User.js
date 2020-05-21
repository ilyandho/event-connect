/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [6, 'Name length must not be less than 6'],
  },
  username: {
    type: String,
    required: [true, 'username is required'],
    unique: [true, 'username already exists'],
    minlength: [6, 'username length must not be less than 6'],
  },
  passwordHash: {
    type: String,
    required: [true, 'password is required'],
    minlength: [8, 'password length must not be less than 8'],
  },
  events: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
  ],
});

UserSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('User', UserSchema);
