import {gql} from 'apollo-server-micro';
import {getLocations, getLocation} from './data';
import {stateLabels} from './format/location';

export * from './DataSource';

export const typeDefs = gql`
  type Query {
    locations: [Location!]!
    location(id: String!): Location
  }
  type Location {
    id: String!
    name: String!
    scenarios: [Scenario!]!
    scenario(id: ID!): Scenario
    parameters: [Parameter!]!
    parameter(id: ID!): Parameter
  }
  type Scenario {
    id: ID!
    name: String!
    distancingLevel: Float!
    distancingDays: Int!
  }
  type Parameter {
    id: String!
    value: Float!
    name: String!
    description: String!
    type: String!
  }
`;

export const resolvers = {
  Query: {
    locations(parent, args) {
      return getLocations().map((id) => ({id}));
    },
    location(parent, {id}) {
      return {id};
    },
  },
  Location: {
    name(parent, args, context) {
      return stateLabels[parent.id] || parent.id;
    },
    async scenarios(parent, args, {dataSources: {json}}) {
      const {scenarios} = await json.getLocation(parent.id);
      return Object.values(scenarios);
    },
    async scenario(parent, args, {dataSources: {json}}) {
      const {scenarios} = await json.getLocation(parent.id);
      return scenarios[args.id];
    },
    async parameters(parent, args, {dataSources: {json}}) {
      const {parameters} = await json.getLocation(parent.id);
      return Object.entries(parameters).map(([id, parameter]) => {
        parameter.id = id;
        return parameter;
      });
    },
    async parameter(parent, args, {dataSources: {json}}) {
      const {parameters} = await json.getLocation(parent.id);
      return parameters[args.id];
    },
  },
};
