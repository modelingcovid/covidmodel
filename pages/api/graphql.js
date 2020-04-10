import {ApolloServer} from 'apollo-server-micro';
import {LocationDataSource, typeDefs, resolvers} from '../../server';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    location: new LocationDataSource(),
  }),
  cacheControl: {defaultMaxAge: 60 * 60},
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({path: '/api/graphql'});
