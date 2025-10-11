import { Container, ServiceIdentifier } from 'typedi';
import { IocContainer } from 'tsoa';

export const iocContainer: IocContainer = {
  get: <T>(controller: any): T => {
    return Container.get<T>(controller);
  },
};
