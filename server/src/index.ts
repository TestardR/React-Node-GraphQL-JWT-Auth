import 'reflect-metadata';
import { UserResolver } from './UserResolver';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import cookieParser from 'cookie-parser';
import { verify } from 'jsonwebtoken';
import { User } from './entity/User';
import { createAccessToken } from './auth';
import { sendRefreshToken } from './sendRefreshToken';

(async () => {
  const app = express();
  app.use(cookieParser());

  app.get('/', (_req, res) => res.send('hello'));

  app.post('/refresh_token', async (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
      return res.send({ ok: false, accessToken: '' });
    }

    let payload: any = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (error) {
      console.log(error);
      return res.send({ ok: false, accessToken: '' });
    }

    const user = await User.findOne({ id: payload.userId });

    if(!user) {
      return res.send({ ok: false, accessToken: '' });
    }

    sendRefreshToken(res, createAccessToken(user))

    return res.send({ok: true, accessToken: createAccessToken(user)})
  });

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
