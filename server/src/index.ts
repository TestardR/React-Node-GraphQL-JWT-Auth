import 'reflect-metadata';
import { UserResolver } from './UserResolver';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';

(async () => {
  const app = express();
  app.get('/', (_req, res) => res.send('hello'));

  await createConnection();

  const appolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  appolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log('express server started');
  });
})();

