import {gql} from 'apollo-server-micro';
import {cumulativeToDailyDistribution} from './data';
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
    dateModelRun: String!
    icuBeds: Int!
    importtime: Float!
    mostRecentDistancingDate: String!
    population: Int!
    r0: Float!
    ventilators: Int!
    days: Series
    scenarios: [Scenario!]!
    scenario(id: ID!): Scenario
    parameters: [Parameter!]!
    parameter(id: ID!): Parameter
    domain: LocationDomain
  }
  type Scenario {
    id: ID!
    name: String!
    dateContained: String
    dateHospitalsOverCapacity: String
    dateICUOverCapacity: String
    totalInfectedFraction: Float!
    fatalityRate: Float!
    fatalityRateSymptomatic: Float!
    fatalityRatePCR: Float!
    fractionOfSymptomaticHospitalized: Float!
    fractionOfSymptomaticHospitalizedOrICU: Float!
    fractionOfPCRHospitalized: Float!
    fractionOfPCRHospitalizedOrICU: Float!
    fractionHospitalizedInICU: Float!
    fractionOfDeathInICU: Float!
    fractionDeathOfHospitalizedOrICU: Float!
    fractionOfInfectionsPCRConfirmed: Float!
    fractionOfDeathsReported: Float!
    fractionOfHospitalizationsReported: Float
    distancingDays: Int!
    distancingLevel: Float!
    hospitalCapacity: Series
    icuCapacity: Series
    distancing: DistributionSeries
    rt: DistributionSeries
    cumulativeCritical: DistributionSeries
    cumulativeReportedCritical: DistributionSeries
    cumulativeDeaths: DistributionSeries
    cumulativeReportedDeaths: DistributionSeries
    cumulativeExposed: DistributionSeries
    cumulativeHospitalized: DistributionSeries
    cumulativePcr: DistributionSeries
    cumulativeRecoveries: DistributionSeries
    cumulativeReportedHospitalized: DistributionSeries
    currentlyCritical: DistributionSeries
    currentlyReportedCritical: DistributionSeries
    currentlyHospitalized: DistributionSeries
    currentlyInfected: DistributionSeries
    currentlyInfectious: DistributionSeries
    currentlyHospitalizedOrICU: DistributionSeries
    currentlyReportedHospitalized: DistributionSeries
    dailyDeath: DistributionSeries
    dailyReportedDeath: DistributionSeries
    newlyExposed: DistributionSeries
    dailyPcr: DistributionSeries
    dailyTestsRequiredForContainment: DistributionSeries
    susceptible: DistributionSeries
  }
  type LocationDomain {
    hospitalCapacity: Domain
    icuCapacity: Domain
    distancing: DistributionDomain
    rt: DistributionDomain
    cumulativeCritical: DistributionDomain
    cumulativeReportedCritical: DistributionDomain
    cumulativeDeaths: DistributionDomain
    cumulativeReportedDeaths: DistributionDomain
    cumulativeExposed: DistributionDomain
    cumulativeHospitalized: DistributionDomain
    cumulativePcr: DistributionDomain
    cumulativeRecoveries: DistributionDomain
    cumulativeReportedHospitalized: DistributionDomain
    currentlyCritical: DistributionDomain
    currentlyReportedCritical: DistributionDomain
    currentlyHospitalized: DistributionDomain
    currentlyInfected: DistributionDomain
    currentlyInfectious: DistributionDomain
    currentlyHospitalizedOrICU: DistributionDomain
    currentlyReportedHospitalized: DistributionDomain
    dailyDeath: DistributionDomain
    dailyReportedDeath: DistributionDomain
    newlyExposed: DistributionDomain
    dailyPcr: DistributionDomain
    dailyTestsRequiredForContainment: DistributionDomain
    susceptible: DistributionDomain
  }
  type DistributionSeries {
    confirmed: Series
    expected: Series
    expectedTestTrace: Series
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
    expectedTestTrace: Domain
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
    length: Int!
  }
  type Parameter {
    id: String!
    value: Float!
    name: String!
    description: String!
    type: String!
    citations: [String]
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

function field(type, decorate) {
  return async function field(parent, args, {dataSources: {get}}, {fieldName}) {
    return await get[type](fieldName, parent, decorate);
  };
}

async function locationProp(parent, args, {dataSources: {get}}, {fieldName}) {
  const location = await get.location(parent.id);
  return location[fieldName];
}

const Location = {
  name(parent, args, context) {
    return stateLabels[parent.id] || parent.id;
  },
  async scenarios(parent, args, {dataSources: {get}}) {
    const locationId = parent.id;
    const {scenarios} = await get.location(locationId);
    return Promise.all(
      scenarios.map((scenarioId) => get.scenario(locationId, scenarioId))
    );
  },
  async scenario(parent, args, {dataSources: {get}}) {
    return await get.scenario(parent.id, args.id);
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
  domain(parent) {
    return parent;
  },
  dateModelRun: locationProp,
  icuBeds: locationProp,
  importtime: locationProp,
  mostRecentDistancingDate: locationProp,
  population: locationProp,
  r0: locationProp,
  ventilators: locationProp,
  async days(parent, args, {dataSources: {get}}) {
    return await get.days(parent.id);
  },
};

const Scenario = {
  dateContained(parent) {
    return parent.summary.dateContained;
  },
  dateHospitalsOverCapacity(parent) {
    return parent.summary.dateHospitalsOverCapacity;
  },
  dateICUOverCapacity(parent) {
    return parent.summary.dateICUOverCapacity;
  },
  totalInfectedFraction(parent) {
    return parent.summary.totalInfectedFraction;
  },
  fatalityRate(parent) {
    return parent.summary.fatalityRate;
  },
  fatalityRateSymptomatic(parent) {
    return parent.summary.fatalityRateSymptomatic;
  },
  fatalityRatePCR(parent) {
    return parent.summary.fatalityRatePCR;
  },
  fractionOfSymptomaticHospitalized(parent) {
    return parent.summary.fractionOfSymptomaticHospitalized;
  },
  fractionOfSymptomaticHospitalizedOrICU(parent) {
    return parent.summary.fractionOfSymptomaticHospitalizedOrICU;
  },
  fractionOfPCRHospitalized(parent) {
    return parent.summary.fractionOfPCRHospitalized;
  },
  fractionOfPCRHospitalizedOrICU(parent) {
    return parent.summary.fractionOfPCRHospitalizedOrICU;
  },
  fractionHospitalizedInICU(parent) {
    return parent.summary.fractionHospitalizedInICU;
  },
  fractionOfDeathInICU(parent) {
    return parent.summary.fractionOfDeathInICU;
  },
  fractionDeathOfHospitalizedOrICU(parent) {
    return parent.summary.fractionDeathOfHospitalizedOrICU;
  },
  fractionOfInfectionsPCRConfirmed(parent) {
    return parent.summary.fractionOfInfectionsPCRConfirmed;
  },
  fractionOfDeathsReported(parent) {
    return parent.summary.fractionOfDeathsReported;
  },
  fractionOfHospitalizationsReported(parent) {
    return parent.summary.fractionOfHospitalizationsReported;
  },
  hospitalCapacity: field('series'),
  icuCapacity: field('series'),
  distancing: field('distribution'),
  rt: field('distribution'),
  cumulativeCritical: field('distribution'),
  cumulativeReportedCritical: field('distribution'),
  cumulativeDeaths: field('distribution'),
  cumulativeReportedDeaths: field('distribution'),
  cumulativeExposed: field('distribution'),
  cumulativeHospitalized: field('distribution'),
  cumulativePcr: field('distribution'),
  cumulativeRecoveries: field('distribution'),
  cumulativeReportedHospitalized: field('distribution'),
  currentlyCritical: field('distribution'),
  currentlyReportedCritical: field('distribution'),
  currentlyHospitalized: field('distribution'),
  currentlyInfected: field('distribution'),
  currentlyInfectious: field('distribution'),
  currentlyHospitalizedOrICU: field('distribution'),
  currentlyReportedHospitalized: field('distribution'),
  dailyDeath: field('distribution'),
  dailyReportedDeath: field('distribution'),
  newlyExposed: field('distribution'),
  dailyPcr: field('distribution'),
  dailyTestsRequiredForContainment: field('distribution'),
  susceptible: field('distribution'),
};

function getSharedDomain(values) {
  return {
    max: Math.max(...values.map(({max}) => max)),
    min: Math.min(...values.map(({min}) => min)),
  };
}

const defaultAccessor = ({get, type, fieldName, parent}) =>
  get[type](fieldName, parent);

function domain(type, accessor = defaultAccessor) {
  return async function domain(
    parent,
    args,
    {dataSources: {get}},
    {fieldName}
  ) {
    const locationId = parent.id;
    const {scenarios} = await get.location(locationId);
    const values = await Promise.all(
      scenarios.map((id) =>
        accessor({get, type, fieldName, parent: {id, locationId}})
      )
    );
    switch (type) {
      case 'series':
        return getSharedDomain(values);
      case 'distribution':
        const result = {};
        Object.keys(values[0]).forEach((key) => {
          result[key] = getSharedDomain(values.map((value) => value[key]));
        });
        return result;
    }
  };
}

const LocationDomain = {
  hospitalCapacity: domain('series'),
  icuCapacity: domain('series'),
  distancing: domain('distribution'),
  rt: domain('distribution'),
  cumulativeCritical: domain('distribution'),
  cumulativeReportedCritical: domain('distribution'),
  cumulativeDeaths: domain('distribution'),
  cumulativeReportedDeaths: domain('distribution'),
  cumulativeExposed: domain('distribution'),
  cumulativeHospitalized: domain('distribution'),
  cumulativePcr: domain('distribution'),
  cumulativeRecoveries: domain('distribution'),
  cumulativeReportedHospitalized: domain('distribution'),
  currentlyCritical: domain('distribution'),
  currentlyReportedCritical: domain('distribution'),
  currentlyHospitalized: domain('distribution'),
  currentlyInfected: domain('distribution'),
  currentlyInfectious: domain('distribution'),
  currentlyReportedHospitalized: domain('distribution'),
  dailyDeath: domain('distribution'),
  dailyReportedDeath: domain('distribution'),
  newlyExposed: domain('distribution'),
  dailyPcr: domain('distribution'),
  dailyTestsRequiredForContainment: domain('distribution'),
  susceptible: domain('distribution'),
};

export const resolvers = {
  Query,
  Location,
  LocationDomain,
  Scenario,
};
