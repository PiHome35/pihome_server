import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { ClientContext } from '../interfaces/context.interface';

export const CurrentClient = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const logger = new Logger('CurrentClient');
  // Check if the context is a GraphQL context
  if (context.getType<GqlContextType>() === 'graphql') {
    const ctx = GqlExecutionContext.create(context);
    logger.log('Current client (GraphQL)', ctx.getContext().req.user);
    return ctx.getContext().req.user as ClientContext;
  }

  // Handle HTTP context
  const request = context.switchToHttp().getRequest();
  logger.log('Current client (HTTP)', request.user);
  return request.user as ClientContext;
});
