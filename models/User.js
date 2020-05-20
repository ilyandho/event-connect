const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  fullName: { type: String, required: true, minlength: 8 },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
  },
  passwordHash: { type: String, required: true, minlength: 8 },
  events: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
  ],
});

module.exports = mongoose.model('User', UserSchema);
