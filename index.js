require('dotenv').config();
const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');

// const Event = require('./models/Event');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

mongoose
  .connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message);
  });

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen(5000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
