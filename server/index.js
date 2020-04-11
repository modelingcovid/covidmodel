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

const series1 = (parent, args, context, {fieldName}) => {
  const {timeSeriesData} = parent;
  return timeSeriesData.map((d) => d[fieldName]);
};

const series2 = (parent, args, context, {path}) => {
  const {timeSeriesData} = parent;
  const key1 = path.prev.key;
  const key2 = path.key;
  return timeSeriesData.map((d) => d[key1][key2]);
};

const distribution = (parent) => parent;

const Scenario = {
  day: series1,
  distancing: series1,
  cumulativeCritical: distribution,
  cumulativeDeaths: distribution,
  cumulativeExposed: distribution,
  cumulativeHospitalized: distribution,
  cumulativePcr: distribution,
  cumulativeRecoveries: distribution,
  cumulativeReportedHospitalized: distribution,
  currentlyCritical: distribution,
  currentlyHospitalized: distribution,
  currentlyInfected: distribution,
  currentlyInfectious: distribution,
  currentlyReportedHospitalized: distribution,
  dailyPcr: distribution,
  dailyTestsRequiredForContainment: distribution,
  susceptible: distribution,
};

const Distribution = {
  expected: series2,
  confirmed: series2,
  percentile10: series2,
  percentile20: series2,
  percentile30: series2,
  percentile40: series2,
  percentile50: series2,
  percentile60: series2,
  percentile70: series2,
  percentile80: series2,
  percentile90: series2,
  percentile100: series2,
};

const Series = {
  data: (parent) => parent,
  empty: (parent) => parent.some((n) => !!n),
  min: (parent) => Math.min(...parent),
  max: (parent) => Math.max(...parent),
};

export const resolvers = {
  Query,
  Location,
  Scenario,
  Distribution,
  Series,
};
