const { PrismaClient } = require('@prisma/client');
const { prisma, prismaWithPool } = require('./client');

module.exports = {
  PrismaClient,
  prisma,
  prismaWithPool,
};
