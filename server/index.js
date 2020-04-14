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
    population: Int!
    importtime: Float!
    r0: Float!
    scenarios: [Scenario!]!
    scenario(id: ID!): Scenario
    parameters: [Parameter!]!
    parameter(id: ID!): Parameter
    domain: LocationDomain
  }
  type Scenario {
    id: ID!
    name: String!
    distancingDays: Int!
    distancingLevel: Float!
    day: Series
    distancing: Series
    hospitalCapacity: Series
    cumulativeCritical: DistributionSeries
    cumulativeDeaths: DistributionSeries
    cumulativeExposed: DistributionSeries
    cumulativeHospitalized: DistributionSeries
    cumulativePcr: DistributionSeries
    cumulativeRecoveries: DistributionSeries
    cumulativeReportedHospitalized: DistributionSeries
    currentlyCritical: DistributionSeries
    currentlyHospitalized: DistributionSeries
    currentlyInfected: DistributionSeries
    currentlyInfectious: DistributionSeries
    currentlyReportedHospitalized: DistributionSeries
    dailyDeaths: DistributionSeries
    dailyPcr: DistributionSeries
    dailyTestsRequiredForContainment: DistributionSeries
    susceptible: DistributionSeries
  }
  type LocationDomain {
    day: Domain
    distancing: Domain
    hospitalCapacity: Domain
    cumulativeCritical: DistributionDomain
    cumulativeDeaths: DistributionDomain
    cumulativeExposed: DistributionDomain
    cumulativeHospitalized: DistributionDomain
    cumulativePcr: DistributionDomain
    cumulativeRecoveries: DistributionDomain
    cumulativeReportedHospitalized: DistributionDomain
    currentlyCritical: DistributionDomain
    currentlyHospitalized: DistributionDomain
    currentlyInfected: DistributionDomain
    currentlyInfectious: DistributionDomain
    currentlyReportedHospitalized: DistributionDomain
    dailyDeaths: DistributionDomain
    dailyPcr: DistributionDomain
    dailyTestsRequiredForContainment: DistributionDomain
    susceptible: DistributionDomain
  }
  type DistributionSeries {
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
  type Domain {
    max: Float!
    min: Float!
  }
  type DistributionDomain {
    confirmed: Domain
    expected: Domain
    percentile10: Domain
    percentile20: Domain
    percentile30: Domain
    percentile40: Domain
    percentile50: Domain
    percentile60: Domain
    percentile70: Domain
    percentile80: Domain
    percentile90: Domain
    percentile100: Domain
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

const locationProp = (prop) =>
  async function locationProp(parent, args, {dataSources: {get}}) {
    const location = await get.location(parent.id);
    return location[prop];
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
  population: locationProp('population'),
  domain: locationProp('domain'),
  importtime: locationProp('importtime'),
  r0: locationProp('r0'),
};

export const resolvers = {
  Query,
  Location,
};
