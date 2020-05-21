const { UserInputError, AuthenticationError } = require('apollo-server');
const { uuid } = require('uuidv4');
const { createWriteStream } = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const Event = require('./models/Event');
const User = require('./models/User');

const resolvers = {
  Query: {
    events: async () => {
      const events = await Event.find({});
      const formattedEvents = events.map((event) => {
        if (event.posterPath) {
          // eslint-disable-next-line no-param-reassign
          event.posterPath = path.join(__dirname, event.posterPath);
        }
        return event;
      });
      console.log(formattedEvents);
      return formattedEvents;
    },
    event: async (root, args) => {
      if (!args) {
        throw new UserInputError('Please provide the event id');
      }
      try {
        const event = await Event.findById({ _id: args.id }).populate(
          'creator',
          'id fullName username'
        );
        console.log('EVents: ', event);
        if (!event) {
          return new Error(`no event found with id: ${args.id}`);
        }
        if (event.posterPath) {
          event.posterPath = path.join(__dirname, event.posterPath);
        }
        return event;
      } catch (err) {
        if (err.name === 'CastError') {
          return new Error(`Event id: ${args.id} is malformatted`);
        }

        return err;
      }
    },
    me: (root, args, { currentUser }) => currentUser,
  },
  Mutation: {
    createEvent: async (_, args, { currentUser }) => {
      const {
        name,
        description,
        host,
        type,
        category,
        address,
        tag,
        date,
        avatar,
      } = args;

      if (!currentUser) {
        throw new AuthenticationError('Login to create events');
      }

      const user = await User.findById({ _id: currentUser._id });
      const posterPath = await avatar.then(async (file) => {
        const { createReadStream, filename } = await file;
        const id = uuid();
        const pathToPoster = `./uploads/images/${filename.toLowerCase()}-${id}`;
        const image = await new Promise((res) => {
          createReadStream()
            .pipe(createWriteStream(pathToPoster))
            .on('close', () => res({ pathToPoster }));
        });
        return image;
      });
      const event = {
        name,
        description,
        host,
        type,
        category,
        address,
        tag,
        date,
        creator: currentUser._id,
        posterPath: posterPath.pathToPoster,
      };

      try {
        const result = await Event.create(event);
        user.events.push(result._id);
        await user.save();
        return result.toJSON();
      } catch (err) {
        throw new UserInputError(err.message, {
          invalidArgs: args,
        });
      }
    },
    deleteEvent: async (_, args, { currentUser }) => {
      if (!args) {
        throw new UserInputError('Please provide the event id');
      }

      if (!currentUser) {
        throw new AuthenticationError('You are not logged in');
      }

      try {
        const event = await Event.findById({ _id: args.id });
        if (!event) {
          throw new UserInputError(`no blog with id ${args.id} is found`);
        }

        if (currentUser.id === event.creator._id) {
          throw new AuthenticationError('you can only delete your events');
        }

        await Event.findOneAndDelete({ _id: args.id });
        return 'deleted';
      } catch (err) {
        if (err.name === 'CastError') {
          return new Error(`Event id: ${args.id} is malformatted`);
        }

        return err;
      }
    },
    updateEvent: async (_, args, { currentUser }) => {
      if (!args) {
        throw new UserInputError('Please provide the event id');
      }

      try {
        const eventFound = await Event.findById({ _id: args.id });

        if (!eventFound) {
          throw new UserInputError(`no blog with id ${args.id} is found`);
        }
        console.log(currentUser.id, '-- -', eventFound.creator._id);
        if (
          // eslint-disable-next-line operator-linebreak
          JSON.stringify(currentUser.id) !==
          JSON.stringify(eventFound.creator._id)
        ) {
          throw new AuthenticationError('you can only updated your events');
        }

        // if (eventFound.creator._id)
        const event = await Event.findOneAndUpdate({ _id: args.id }, args, {
          new: true,
        }).populate('creator', '_id fullName username');
        return event;
      } catch (err) {
        if (err.name === 'CastError') {
          return new Error(`Event id: ${args.id} is malformatted`);
        }

        return err;
      }
    },
    addUser: async (_, args) => {
      if (!args.fullName) {
        throw new UserInputError('please add your name');
      }

      if (!args.username) {
        throw new UserInputError('please add a username');
      }
      if (!args.password) {
        throw new UserInputError('please add a password');
      }
      try {
        const hashPassword = await bcrypt.hash(args.password.trim(), 10);

        const userExists = await User.findOne({ username: args.username });
        if (userExists) {
          throw new Error('username already exists');
        }

        const result = await User.create({
          ...args,
          passwordHash: hashPassword,
        });
        const user = result.toJSON();
        console.log(user);
        return user;
      } catch (err) {
        throw new UserInputError(err.message);
      }
    },
    editUserPassword: async (_, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('You are not logged in');
      }
      const userExists = await User.findOne({ username: args.username });
      if (!userExists) {
        throw new Error('User does not');
      }

      if (currentUser.username !== userExists.username) {
        throw new AuthenticationError('You are not allowed to edit this user');
      }
      try {
        const hashPassword = await bcrypt.hash(args.password, 10);

        const user = await User.findOneAndUpdate(
          { username: args.username },
          {
            passwordHash: hashPassword,
          },
          {
            new: true,
          }
        );
        return user.toJSON();
      } catch (err) {
        return err;
      }
    },
    login: async (_, args) => {
      const result = await User.findOne({ username: args.username });
      const user = result.toJSON();
      if (!user || !args.password) {
        throw new UserInputError('wrong credentials');
      }

      const correctPass = await bcrypt.compare(
        args.password,
        user.passwordHash
      );

      if (!correctPass) {
        throw new UserInputError(
          ' either the username or password is not correct'
        );
      }

      const userDetails = {
        username: user.username,
        id: user.id,
      };
      return { value: jwt.sign(userDetails, process.env.JWT_SECRET) };
    },
  },
};

module.exports = resolvers;
