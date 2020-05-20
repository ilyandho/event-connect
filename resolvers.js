const { UserInputError } = require('apollo-server');
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
        const event = await Event.findById({ _id: args.id });
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
  },
  Mutation: {
    createEvent: async (_, args) => {
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

      // if (avatar) {
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

      const link = path.join(__dirname, posterPath.pathToPoster);
      console.log('link', link);

      console.log('poster', posterPath.pathToPoster);
      const event = new Event({
        name,
        description,
        host,
        type,
        category,
        address,
        tag,
        date,
        posterPath: posterPath.pathToPoster,
      });

      try {
        const result = await event.save();

        return result;
      } catch (err) {
        throw new UserInputError(err.message, {
          invalidArgs: args,
        });
      }
    },
    deleteEvent: async (_, args) => {
      if (!args) {
        throw new UserInputError('Please provide the event id');
      }

      try {
        await Event.findByIdAndDelete({ _id: args.id });
        return 'deleted';
      } catch (err) {
        if (err.name === 'CastError') {
          return new Error(`Event id: ${args.id} is malformatted`);
        }

        return err;
      }
    },
    updateEvent: async (_, args) => {
      if (!args) {
        throw new UserInputError('Please provide the event id');
      }

      try {
        await Event.findByIdAndUpdate(args.id, args);
        const event = await Event.findById({ _id: args.id });
        return event;
      } catch (err) {
        if (err.name === 'CastError') {
          return new Error(`Event id: ${args.id} is malformatted`);
        }

        return err;
      }
    },
    addUser: async (_, args) => {
      try {
        const hashPassword = await bcrypt.hash(args.password, 10);
        const user = new User({ ...args, passwordHash: hashPassword });
        const savedUser = await user.save();
        console.log(savedUser);
        return savedUser;
      } catch (err) {
        console.log('error while saving', err);
        if (err.code === '11000') {
          throw new Error(`username ${args.username}  already exists`);
        }
        if (err.kind === 'required') {
          if (err.path === 'passwordHash') {
            throw UserInputError('password is required');
          }
          if (err.path === 'username') {
            throw UserInputError('username is required');
          }
          if (err.path === 'name') {
            throw UserInputError('name is required');
          }
        }
        return { error: 'err.message' };
      }
    },
    editUserPassword: async (_, args) => {
      try {
        // await User.findByIdAndUpdate(args.username,);
        // const user = await User.findById({ username: args.username });
        const hashPassword = await bcrypt.hash(args.password, 10);

        const user = await User.findOneAndUpdate(args.username, {
          passwordHash: hashPassword,
        });

        console.log(user);
        // user.passwordHash = hashPassword;
        // user.save();
        return user;
      } catch (err) {
        // if (err.name === 'CastError') {
        //   return new Error(`Event id: ${args.id} is malformatted`);
        // }

        return err;
      }
    },
    login: async (_, args) => {
      const user = await User.findOne({ username: args.username });

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
        // eslint-disable-next-line no-underscore-dangle
        id: user._id,
      };
      console.log(userDetails);
      return { value: jwt.sign(userDetails, process.env.JWT_SECRET) };
    },
  },
};

module.exports = resolvers;
