import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (executionContext: string, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    return req.user as User;
  },
);
