import { Container } from 'typedi';
import { IocContainer } from 'tsoa';

export const iocContainer: IocContainer = {
  get: <T>(controller: import('tsoa').ServiceIdentifier<T>): T | Promise<T> => {
    // TypeDI expects a constructor function or string token. TSOA's ServiceIdentifier covers both.
    // This cast is necessary due to mismatches between tsoa and typedi typings.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Container.get<T>(controller as any);
  },
};
