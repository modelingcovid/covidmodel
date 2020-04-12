import {gql} from 'apollo-server-micro';
import {getLocations, getLocation} from './data';
import {stateLabels} from './format/location';

export * from './CoreDataSource';

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
    population: Int!
  }
  type Scenario {
    id: ID!
    name: String!
    day: Series
    distancing: Series
    distancingDays: Int!
    distancingLevel: Float!
    cumulativeCritical: Distribution
    cumulativeDeaths: Distribution
    cumulativeExposed: Distribution
    cumulativeHospitalized: Distribution
    cumulativePcr: Distribution
    cumulativeRecoveries: Distribution
    cumulativeReportedHospitalized: Distribution
    currentlyCritical: Distribution
    currentlyHospitalized: Distribution
    currentlyInfected: Distribution
    currentlyInfectious: Distribution
    currentlyReportedHospitalized: Distribution
    dailyPcr: Distribution
    dailyTestsRequiredForContainment: Distribution
    susceptible: Distribution
  }
  type Distribution {
    confirmed: Series
    expected: Series
    percentile10: Series
    percentile20: Series
    percentile30: Series
    percentile40: Series
    percentile50: Series
    percentile60: Series
    percentile70: Series
    percentile80: Series
    percentile90: Series
    percentile100: Series
  }
  type Series {
    data: [Float]
    empty: Boolean
    max: Float!
    min: Float!
  }
  type Parameter {
    id: String!
    value: Float!
    name: String!
    description: String!
    type: String!
  }
`;

const Query = {
  async locations(parent, args, {dataSources: {get}}) {
    const locations = await get.json('locations');
    return locations.map((id) => ({id}));
  },
  location(parent, {id}) {
    return {id};
  },
};

const Location = {
  name(parent, args, context) {
    return stateLabels[parent.id] || parent.id;
  },
  async scenarios(parent, args, {dataSources: {get}}) {
    const {scenarios} = await get.location(parent.id);
    return Object.values(scenarios);
  },
  async scenario(parent, args, {dataSources: {get}}) {
    const {scenarios} = await get.location(parent.id);
    return scenarios[args.id];
  },
  async parameters(parent, args, {dataSources: {get}}) {
    const {parameters} = await get.location(parent.id);
    return Object.entries(parameters).map(([id, parameter]) => {
      parameter.id = id;
      return parameter;
    });
  },
  async parameter(parent, args, {dataSources: {get}}) {
    const {parameters} = await get.location(parent.id);
    return parameters[args.id];
  },
  async population(parent, args, {dataSources: {get}}) {
    const {population} = await get.location(parent.id);
    return population;
  },
};

export const resolvers = {
  Query,
  Location,
};
