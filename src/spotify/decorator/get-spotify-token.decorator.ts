import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetSpotifyToken = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.spotifyToken;
});
