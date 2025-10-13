import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { AppDataSource } from '../Server/Database';
import User from '../Entities/Users/User';

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET, // Use process.env.SECRET as defined in UserController
};

export const jwtStrategy = new JwtStrategy(jwtOptions, async (payload: { id: string }, done) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: payload.id } });

    if (user) {
      // Attach the necessary user information to the request object
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
});

// Extend the Express Request type to include the user property
