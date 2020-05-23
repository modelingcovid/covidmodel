import dayjs from 'dayjs';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient({
  forceTransactions: true,
});

import {
  decorateLocationSummary,
  decorateScenarioSummary,
  decorateSeries,
  decorateDistribution,
} from './data';
import {ObjectDataSource} from './util';

const identity = (x) => x;

export class CoreDataSource extends ObjectDataSource {
  defaultTtl = 3600;

  // get rid of get
  _get(filepath, options) {
    const origin = this.context.origin;
    const url = `${origin}/json/${filepath}.json`;
    return this.query(url, options);
  }

  json(filepath) {
    return this._get(filepath);
  }

  // switch these to config objects
  location(locationId) {
    return new Promise(async (resolve, reject) => {
      try {
        const [modelRun] = await prisma.modelRun.findMany({
          where: {production: true},
        });

        const [location] = await prisma.location.findMany({
          where: {
            name: locationId,
            modelRunId: modelRun.id,
          },
          select: {
            dateModelRun: true,
            icuBeds: true,
            importtime: true,
            mostRecentDistancingDate: true,
            population: true,
            r0: true,
            ventilators: true,
            parameters: true,
            scenarios: true,
          },
        });

        const formattedLocation = decorateLocationSummary(
          {
            dateModelRun: location.dateModelRun,
            icuBeds: location.icuBeds,
            importtime: location.importtime,
            mostRecentDistancingDate: location.mostRecentDistancingDate,
            population: location.population,
            r0: location.r0,
            ventilators: location.ventilators,
            parameters: location.parameters,
            scenarios: location.scenarios.map((s) => s.name),
          },
          locationId
        );

        resolve(formattedLocation);
      } catch (e) {
        reject(e.toString());
      }
    });
  }

  days(locationId) {
    return new Promise(async (resolve, reject) => {
      try {
        const [modelRun] = await prisma.modelRun.findMany({
          where: {production: true},
        });

        const [location] = await prisma.location.findMany({
          where: {
            name: locationId,
            modelRunId: modelRun.id,
          },
          select: {
            importtime: true,
          },
        });

        const data = new Array(370 - (Math.floor(location.importtime) - 5) + 1)
          .fill()
          .map((x, i) => i + Math.floor(location.importtime) - 5);

        resolve(decorateSeries(data));
      } catch (e) {
        reject(e.toString());
      }
    });
  }

  scenario(locationId, scenarioId) {
    return new Promise(async (resolve, reject) => {
      try {
        const [modelRun] = await prisma.modelRun.findMany({
          where: {production: true},
        });

        const [location] = await prisma.location.findMany({
          where: {
            name: locationId,
            modelRunId: modelRun.id,
          },
        });

        const [scenario] = await prisma.scenario.findMany({
          where: {
            name: scenarioId,
            locationId: location.id,
          },
        });

        const parsedData = decorateScenarioSummary(
          {
            id: scenarioId,
            name: scenario.displayName || 'Current Indefinite',
            distancingLevel: scenario.distancingLevel,
            distancingDays: scenario.distancingDays,
            summary: {
              dateContained: scenario.dateContained,
              dateHospitalsOverCapacity: scenario.dateHospitalsOverCapacity,
              dateICUOverCapacity: scenario.dateICUOverCapacity,
              totalInfectedFraction: scenario.totalInfectedFraction,
              fatalityRate: scenario.fatalityRate,
              fatalityRateSymptomatic: scenario.fatalityRateSymptomatic,
              fatalityRatePCR: scenario.fatalityRatePCR,
              fractionOfSymptomaticHospitalized:
                scenario.fractionOfSymptomaticHospitalized,
              fractionOfSymptomaticHospitalizedOrICU:
                scenario.fractionOfSymptomaticHospitalizedOrICU,
              fractionOfPCRHospitalized: scenario.fractionOfPCRHospitalized,
              fractionOfPCRHospitalizedOrICU:
                scenario.fractionOfPCRHospitalizedOrICU,
              fractionHospitalizedInICU: scenario.fractionHospitalizedInICU,
              fractionOfDeathInICU: scenario.fractionOfDeathInICU,
              fractionDeathOfHospitalizedOrICU:
                scenario.fractionDeathOfHospitalizedOrICU,
              fractionOfInfectionsPCRConfirmed:
                scenario.fractionOfInfectionsPCRConfirmed,
              fractionOfDeathsReported: scenario.fractionOfDeathsReported,
              fractionOfHospitalizationsReported:
                scenario.fractionOfHospitalizationsReported,
            },
          },
          locationId
        );

        resolve(parsedData);
      } catch (e) {
        reject(e.toString());
      }
    });
  }

  series(seriesName, scenario, decorate = identity) {
    const {id, locationId} = scenario;

    return new Promise(async (resolve, reject) => {
      try {
        const [modelRun] = await prisma.modelRun.findMany({
          where: {production: true},
        });

        const [location] = await prisma.location.findMany({
          where: {
            name: locationId,
            modelRunId: modelRun.id,
          },
        });

        const [scenario] = await prisma.scenario.findMany({
          where: {
            name: id,
            locationId: location.id,
          },
        });

        const [series] = await prisma.series.findMany({
          where: {
            name: seriesName,
            scenarioId: scenario.id,
          },
        });

        resolve(decorateSeries(decorate(JSON.parse(series.data))));
      } catch (e) {
        reject(e.toString());
      }
    });
  }

  distribution(distributionName, scenario) {
    const {id, locationId} = scenario;

    return new Promise(async (resolve, reject) => {
      try {
        const [modelRun] = await prisma.modelRun.findMany({
          where: {production: true},
        });

        const [location] = await prisma.location.findMany({
          where: {
            name: locationId,
            modelRunId: modelRun.id,
          },
        });

        const [scenario] = await prisma.scenario.findMany({
          where: {
            name: id,
            locationId: location.id,
          },
        });

        const [series] = await prisma.series.findMany({
          where: {
            name: distributionName,
            scenarioId: scenario.id,
          },
        });

        resolve(decorateDistribution(JSON.parse(series.data)));
      } catch (e) {
        reject(e.toString());
      }
    });
  }
}
