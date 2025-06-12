import 'reflect-metadata';
import { Container } from 'inversify';
import { AuthService } from './services/core/AuthService';
import { EmployeeService } from './services/employee-publisher/EmployeeService';
import { TestApiService } from './services/ORII/TestApiService';

var container = new Container();
container.bind("AuthService").toConstantValue(new AuthService());
container.bind("EmployeeService").toConstantValue(EmployeeService);
container.bind("TestApiService").toConstantValue(TestApiService);

export default container;

// Interceptors
import { ORIIInterceptors } from './services/interceptors/ORIIInterceptors';
import { EmployeePublisherInterceptors } from './services/interceptors/EmployeePublisherInterceptors';
new ORIIInterceptors();
new EmployeePublisherInterceptors();