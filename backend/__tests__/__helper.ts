import * as dotenv from 'dotenv';
import * as http from 'http';
import getPort = require('get-port');
import { GraphQLClient } from 'graphql-request';
import { createServer } from '../src/server';
import { generateJWT, UserCredentials } from '../src/types/utils/auth';
import { MockProxy, mockDeep } from 'jest-mock-extended';
import { Clevertap, Voucherify } from '../src/types/services';
import { PrismaClient } from '@treedots/prisma';

dotenv.config();

const {
  CT_HOST,
  CT_ACCOUNT_ID,
  CT_PASSCODE,
  VOUCHERIFY_HOST,
  VOUCHERIFY_APPID,
  VOUCHERIFY_SECRET_KEY
} = process.env;

type TestContext = {
  client: GraphQLClient;
  prisma: MockProxy<PrismaClient>;
  clevertap: Clevertap;
  voucherify: Voucherify;
  token: string;
};

export function createTestContext(credential?: UserCredentials): TestContext {
  const ctx = {} as TestContext;
  const prisma = mockDeep<PrismaClient>();
  const graphqlCtx = graphqlTestContext(prisma);
  const clevertap = new Clevertap({
    host: CT_HOST,
    accountId: CT_ACCOUNT_ID,
    passcode: CT_PASSCODE
  });
  const voucherify = new Voucherify({
    apiUrl: VOUCHERIFY_HOST,
    applicationId: VOUCHERIFY_APPID,
    clientSecretKey: VOUCHERIFY_SECRET_KEY
  });

  beforeEach(async () => {
    const client = await graphqlCtx.before();
    Object.assign(ctx, {
      client,
      prisma,
      clevertap,
      voucherify,
      token: credential ? generateJWT(credential) : undefined
    });
  });

  afterEach(async () => {
    await graphqlCtx.after();
  });

  return ctx;
}

function graphqlTestContext(prisma: PrismaClient) {
  let serverInstance: http.Server | null = null;
  return {
    async before() {
      const port = await getPort({ port: getPort.makeRange(9000, 10000) });
      serverInstance = createServer(prisma).listen({ port });
      return new GraphQLClient(`http://localhost:${port}/graphql`);
    },
    async after() {
      prisma.$disconnect();
      serverInstance?.close();
    }
  };
}
