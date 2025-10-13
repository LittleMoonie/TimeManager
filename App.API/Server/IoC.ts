import { Container } from 'typedi';
import { IocContainer, ServiceIdentifier } from 'tsoa';

export const iocContainer: IocContainer = {
  get: <T>(someClass: ServiceIdentifier<T>): T => {
    return Container.get(someClass as never);
  },
};
