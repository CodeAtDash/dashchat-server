import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applicationConfig } from 'config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './utils/all-exception.filter';

import { SpelunkerModule } from 'nestjs-spelunker';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Adding spelunkar 'https://github.com/jmcdo29/nestjs-spelunker'
  const tree = SpelunkerModule.explore(app);
  const root = SpelunkerModule.graph(tree);
  const edges = SpelunkerModule.findGraphEdges(root);
  console.log('graph LR');
  const mermaidEdges = edges.map(
    ({ from, to }) => `  ${from.module.name}-->${to.module.name}`,
  );
  console.log(mermaidEdges.join('\n'));
  //keep eye on it,not to fall into circular dependencies, comment it out for production

  app.useGlobalPipes(new ValidationPipe());

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  const res = await app.listen(applicationConfig.app.port, '0.0.0.0');
  const serverAddress = res.address();

  Logger.log(
    `⚡ Server is listening at http://${serverAddress.address}:${serverAddress.port}`,
  );
}

bootstrap();
