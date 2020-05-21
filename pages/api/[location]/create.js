import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

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

    try {
      const parameterCreateArray = Object.keys(parameters).map((p) => ({
        value: parseFloat(parameters[p].value),
        name: parameters[p].name,
        description: parameters[p].description,
        type: parameters[p].type,
      }));

      const scenarioCreateArray = Object.keys(scenarios).map((s) => {
        const scenario = scenarios[s];

        return {
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
            create: Object.keys(scenario.timeSeriesData).map((series) => ({
              name: series,
              data: JSON.stringify(scenario.timeSeriesData[series]),
            })),
          },
        };
      });

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
            create: parameterCreateArray,
          },
          scenarios: {
            create: scenarioCreateArray,
          },
        },
      });

      res.status(200).json(newLocation);
    } catch (e) {
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
