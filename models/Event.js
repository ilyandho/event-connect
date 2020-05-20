const mongoose = require('mongoose');
const geocoder = require('../utils/geocoder');

// const pointSchema = new mongoose.Schema({
//   type: {
//     type: String,
//     enum: ['Point'],
//   },
//   coordinates: {
//     type: [Number],
//     index: '2dsphere',
//   },
// });

const EventSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  host: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'Appearance or Signing',
      'Attraction',
      'Camp, Trip, or Retreat',
      'Class, Training, or Workshop',
      'Concert or Performance',
      'Conference',
      'Convention',
      'Dinner or Gala',
      'Festival or Fair',
      'Game or Competition',
      'Meeting or Networking Event',
      'Other',
      'Party or Social Gathering',
      'Race or Endurance Event',
      'Rally',
      'Screening',
      'Seminar or Talk',
      'Tour',
      'Tournament',
      'Tradeshow, Consumer Show, or Expo',
    ],
  },
  category: {
    type: String,
    enum: [
      'Auto, Boat &amp; Air',
      'Business &amp; Professional',
      'Charity &amp; Causes',
      'Community &amp; Culture',
      'Family &amp; Education',
      'Fashion &amp; Beauty',
      'Film, Media &amp; Entertainment',
      'Food &amp; Drink',
      'Government &amp; Politics',
      'Health &amp; Wellness',
      'Hobbies &amp; Special Interest',
      'Home &amp; Lifestyle',
      'Music',
      'Other',
      'Performing &amp; Visual Arts',
      'Religion &amp; Spirituality',
      'School Activities',
      'Science &amp; Technology',
      'Seasonal &amp; Holiday',
      'Sports &amp; Fitness',
      'Travel &amp; Outdoor',
    ],
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
  },
  venue: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
    },
    formattedAddress: String,
  },
  tag: [String],
  date: { type: Date, required: true },
  posterPath: String,
});

// Geocode & create location
// eslint-disable-next-line func-names
EventSchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.venue = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
  };

  // Do not save address
  this.address = undefined;
  next();
});

module.exports = mongoose.model('Event', EventSchema);
