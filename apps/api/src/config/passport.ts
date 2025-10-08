import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

import User from '../models/user';
import { AppDataSource } from '../server/database';

export default (pass: passport.PassportStatic) => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    secretOrKey: process.env.SECRET,
  };

  pass.use(
    new JwtStrategy(opts, async (jwtPayload, done) => {
      try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository?.findOne({ where: { id: jwtPayload.id } });

        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    }),
  );
};
