const { buildSchema } = require("graphql");

// Construct a schema, using GraphQL schema language
module.exports = buildSchema(`
  scalar Date
  scalar Void
  scalar JSONObject

  type Query {
    printHello: String!
    getRecords( userId: ID! ): [Record]!
    getUserTags( userId: ID! ): JSONObject!
    getRecordTags( recordId: ID! ): JSONObject!
    getActivities( userId: ID! ): [Activity]!
    getInterestedDepartments( userId: ID! ): [Int]!
    getUser( userId: ID!): User!
  }

  type Mutation {
    signUp( input: UserInput! ): User!
    logIn( email: String!, password: String! ): User
    createRecord( userId: ID!, title: String!, description: String!, images: [String], feeling: Float! ): Record!
    updateRecord( id: ID!, title: String, description: String, feeling: Float): Record!
    deleteRecord( ids: [ID]! ): Void
    addUserTag( userId: ID!, tagName: String!): JSONObject!
    updateTagName( userId: ID!, tagKey: String!, tagName: String!): JSONObject!
    deleteUserTag( userId: ID!, tagKey: String!): Boolean!
    createTagsFromRecord( recordId: ID!, userId: ID!, tagName: String! ): Boolean!
    addTagsToRecord( recordId: ID!, tags: JSONObject! ) : Record!
    addImages( recordId: ID!, images: [String]! ) : [String]!
    addImage( recordId: ID!, image: String! ) : [String]!
    deleteImage( recordId: ID! , uri: String! ): [String]!
    uploadDocument(recordId: [ID]!): String!
    createActivity( input: ActivityInput! ) : Activity!
    createInterestedDepartment( userId: ID!, department: [Int]!): InterestedDepartment!
    updateInterestedDepartment( userId: ID!, department: [Int]!): InterestedDepartment!
    updateName ( userId: ID!, name: String! ): User!
    forNLPTestDelete: Void
  }

  input UserInput {
      name: String!
      email: String!
      password: String!
  }

  input ActivityInput {
    type: [Int]! 
    department: [Int]!
    major: [Int]
    title: String!
    host: String!
    location: String
    time: String
    url: String!
    description: String!
    abilities: [Int]! 
    image: String
}

  type Activity {
      id: ID!
      type: [Int]! 
      department: [Int]!
      major: [Int]
      title: String!
      host: String!
      location: String
      time: String
      url: String!
      description: String!
      abilities: [Int]! 
      image: String
  }

  type User {
      id: ID!
      name: String!
      email: String!
      password: String!
      abilityScoreSum: [Float]!
      topDepartment: [String]!
      lackAbilities: [Int]!
  }

  type InterestedDepartment {
      id: ID!
      userId: ID!
      department: [Int]!
      lackAbilities: [Int]!
  }

  type Record{
      id: ID!
      userId: ID!
      title: String!
      description: String!
      tags: JSONObject!
      images: [String]!
      score: [Float]!
      feeling: Float!
      createdAt: Date!
      updatedAt: Date!
  }

  type Tag{
    id: ID!
    userId: ID!
    tags: JSONObject!
  }
`);