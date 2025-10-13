import { Container } from 'typedi';
import { IocContainer } from 'tsoa';

export const iocContainer: IocContainer = {
  get: <T>(controller: { prototype: T }): T | Promise<T> => {
    // typedi expects a constructor function (class), same as tsoa's expected { prototype: T }
    // The 'as any' is required due to typedi typings not matching tsoa directly.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Container.get<T>(controller as any);
  },
};
