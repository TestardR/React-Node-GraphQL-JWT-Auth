import { Context } from './Context';
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Field,
  ObjectType,
  Ctx,
} from 'type-graphql';
import { User } from './entity/User';
import { hash, compare } from 'bcryptjs';
import { createRefreshToken, createAccessToken } from './auth';

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return 'hi';
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Mutation(() => Boolean)
  async register(
    @Arg('email') email: string,
    @Arg('password') password: string
  ) {
    const hashedPassword = await hash(password, 12);

    try {
      await User.insert({
        email,
        password: hashedPassword,
      });
    } catch (error) {
      console.log(error);
      return false;
    }

    return true;
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: Context
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('invalid login');
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      throw new Error('bad password');
    }

    res.cookie('jwt', createAccessToken(user), {
      httpOnly: true,
    });

    return {
      accessToken: createRefreshToken(user),
    };
  }
}
