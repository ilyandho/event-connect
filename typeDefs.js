const { gql } = require('apollo-server');

const typeDefs = gql`
  type File {
    filename: String!
    mimetype: String!
    path: String!
  }

  type Venue {
    type: String!
    coordinates: [Float!]!
    formattedAddress: String!
  }

  type Event {
    id: ID
    name: String!
    description: String!
    host: String!
    venue: Venue!
    type: String!
    category: String!
    tag: [String]
    date: String!
    posterPath: String
  }

  type User {
    fullName: String!
    username: String!
    passwordHash: String!
    events: [Event]
  }

  type Token {
    value: String!
  }
  type Query {
    events: [Event]
    event(id: String!): Event
  }

  type Mutation {
    createEvent(
      name: String!
      description: String!
      host: String!
      type: String!
      category: String!
      address: String!
      tag: [String]
      date: String!
      avatar: Upload
    ): Event

    updateEvent(
      id: String!
      name: String
      description: String
      host: String
      type: String
      category: String
      address: String
      tag: [String]
      date: String
    ): Event

    deleteEvent(id: String!): String!

    addUser(fullName: String!, username: String!, password: String!): User!
    editUserPassword(username: String!, password: String!): User!
    login(username: String!, password: String!): Token!
  }
`;

module.exports = typeDefs;
