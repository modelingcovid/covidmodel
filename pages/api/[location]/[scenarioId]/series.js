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
    query: {scenarioId},
    body: {timeSeriesData},
  } = req;

  let series = [];

  try {
    await asyncForEach(Object.keys(timeSeriesData), async (timeSeries) => {
      const tempSeries = await prisma.series.create({
        data: {
          name: timeSeries,
          data: JSON.stringify(timeSeriesData[timeSeries]),
        },
      });

      series.push(tempSeries);
    });

    const updatedScenario = await prisma.scenario.update({
      where: {
        id: parseInt(scenarioId),
      },
      data: {
        series: {
          connect: series.map((s) => ({id: s.id})),
        },
      },
    });

    res.status(200).json(updatedScenario);
  } catch (e) {
    console.log('error updating scenario with series data', e.toString());
    res.status(500).json({error: e.toString()});
  }
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1000mb',
    },
  },
};
