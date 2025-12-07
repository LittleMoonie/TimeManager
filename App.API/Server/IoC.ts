import { IocContainer, ServiceIdentifier } from 'tsoa';
import { Container } from 'typedi';

export const iocContainer: IocContainer = {
  get: <T>(someClass: ServiceIdentifier<T>): T => {
    return Container.get(someClass as never);
  },
};
