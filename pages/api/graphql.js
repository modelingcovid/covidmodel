import {ApolloServer} from 'apollo-server-micro';
import {
  JsonDataSource,
  CoreDataSource,
  typeDefs,
  resolvers,
} from '../../server';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({req}) => {
    const host = req.headers.host;
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    return {
      origin: `${protocol}://${host}`,
      headers: JSON.stringify(req.headers),
    };
  },
  dataSources: () => ({
    get: new CoreDataSource(),
  }),
  cacheControl: {
    // One year, the longest zeit.co supports:
    // https://zeit.co/docs/v2/network/caching#limits
    defaultMaxAge: 60 * 60 * 24 * 365,
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({path: '/api/graphql'});
