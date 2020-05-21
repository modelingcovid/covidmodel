import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export default async (req, res) => {
  const {
    method,
    query: {location},
  } = req;

  if (!method) {
    res.status(500).end('No HTTP Method Supplied');
  } else if (method === 'PUT') {
    const {
      modelRunId,
      dateModelRun,
      icuBeds,
      importtime,
      mostRecentDistancingDate,
      population,
      r0,
      ventilators,
      parameters,
      scenarios,
    } = req.body;

    let parametersCreated = [];
    let scenariosCreated = [];

    try {
      const parameterCreateArray = Object.keys(parameters).map((p) => ({
        value: parseFloat(parameters[p].value),
        name: parameters[p].name,
        description: parameters[p].description,
        type: parameters[p].type,
      }));

      await asyncForEach(parameterCreateArray, async (p) => {
        const cParams = await prisma.parameter.create({data: p});

        parametersCreated.push(cParams);
      });
    } catch (e) {
      console.log('error creating parameters', e.toString());
      res.status(500).json({error: e.toString()});
    }

    try {
      const scenarioCreateArray = [];

      await asyncForEach(Object.keys(scenarios), async (s) => {
        const scenario = scenarios[s];
        let series = [];

        await asyncForEach(
          Object.keys(scenario.timeSeriesData),
          async (timeSeries) => {
            const tempSeries = await prisma.series.create({
              data: {
                name: timeSeries,
                data: JSON.stringify(scenario.timeSeriesData[timeSeries]),
              },
            });

            series.push(tempSeries);
          }
        );

        scenarioCreateArray.push({
          name: s,
          ...(scenario.events.containment && {
            dateContained: scenario.events.containment.day,
          }),
          ...(scenario.events.hospital && {
            dateHospitalsOverCapacity: scenario.events.hospital.day,
          }),
          ...(scenario.events.icu && {
            dateICUOverCapacity: scenario.events.icu.day,
          }),
          totalInfectedFraction: scenario.summary.totalInfectedFraction,
          fatalityRate: scenario.summary.fatalityRate,
          fatalityRateSymptomatic: scenario.summary.fatalityRateSymptomatic,
          fatalityRatePCR: scenario.summary.fatalityRatePCR,
          fractionOfSymptomaticHospitalized:
            scenario.summary.fractionOfSymptomaticHospitalized,
          fractionOfSymptomaticHospitalizedOrICU:
            scenario.summary.fractionOfSymptomaticHospitalizedOrICU,
          fractionOfPCRHospitalized: scenario.summary.fractionOfPCRHospitalized,
          fractionOfPCRHospitalizedOrICU:
            scenario.summary.fractionOfPCRHospitalizedOrICU,
          fractionHospitalizedInICU: scenario.summary.fractionHospitalizedInICU,
          fractionOfDeathInICU: scenario.summary.fractionOfDeathInICU,
          fractionDeathOfHospitalizedOrICU:
            scenario.summary.fractionDeathOfHospitalizedOrICU,
          fractionOfInfectionsPCRConfirmed:
            scenario.summary.fractionOfInfectionsPCRConfirmed,
          fractionOfDeathsReported: scenario.summary.fractionOfDeathsReported,
          fractionOfHospitalizationsReported:
            scenario.summary.fractionOfHospitalizationsReported,
          distancingDays: scenario.distancingDays,
          distancingLevel: scenario.distancingLevel,
          series: {
            connect: series.map((s) => ({id: s.id})),
          },
        });
      });

      await asyncForEach(scenarioCreateArray, async (s) => {
        const createdScenario = await prisma.scenario.create({
          data: s,
        });

        scenariosCreated.push(createdScenario);
      });
    } catch (e) {
      console.log('error creating scenarios', e.toString());
      res.status(500).json({error: e.toString()});
    }

    try {
      const newLocation = await prisma.location.create({
        data: {
          name: location,
          r0,
          dateModelRun,
          icuBeds,
          importtime,
          mostRecentDistancingDate,
          population,
          ventilators,
          modelRun: {
            connect: {
              id: modelRunId,
            },
          },
          parameters: {
            connect: parametersCreated.map((p) => ({id: p.id})),
          },
          scenarios: {
            connect: scenariosCreated.map((s) => ({id: s.id})),
          },
        },
      });

      console.log('newLocation', newLocation);

      res.status(200).json(newLocation);
    } catch (e) {
      console.log('error creating location', e.toString());
      res.status(500).json({error: e.toString()});
    }
    prisma.disconnect();
  }
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1000mb',
    },
  },
};
