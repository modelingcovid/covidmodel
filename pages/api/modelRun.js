import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export default async (req, res) => {
  const {method} = req;
  if (!method) {
    res.status(500).end('No HTTP Method Supplied');
  } else if (method === 'POST') {
    const modelRun = await prisma.modelRun.create({data: {}});
    prisma.disconnect();
    res.status(200).json(modelRun);
  } else if (method === 'PUT') {
    prisma.disconnect();
  }
};
