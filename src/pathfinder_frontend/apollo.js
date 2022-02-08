import {
    ApolloClient,
    InMemoryCache,
  } from "@apollo/client";


const client = new ApolloClient({
    uri: 'https://desolate-refuge-17724.herokuapp.com/graphql',
    cache: new InMemoryCache()
  });


export default client;