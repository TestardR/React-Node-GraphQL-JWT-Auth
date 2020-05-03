import { Context } from './Context';
import { Middleware } from 'type-graphql/dist/interfaces/Middleware';
import { verify } from 'jsonwebtoken';
import 'dotenv/config';

export const isAuth: Middleware<Context> = ({ context }, next) => {
  const authorization = context.req.headers['authorization'];

  if (!authorization) {
    throw new Error('not authenticated');
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    context.payload = payload as any;
  } catch (error) {
    console.log(error);
    throw new Error('not authenticated');
  }

  return next();
};
