import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { Public } from './utils/decorators/public';
import { applicationConfig } from 'config';
import { SomethingWentWrong, Unauthorized } from './utils/exceptions';
import { Axios } from 'axios';
import * as qs from 'qs';
import { UsersService } from './users/services/users.service';
import { feDomain, generateJwt } from './utils/helpers';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class AppController {
  private axiosAuth: Axios;
  private authProxyBaseUrl: string;

  constructor(
    private readonly appService: AppService,
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {
    this.authProxyBaseUrl = applicationConfig.linkedin.serverUrl;
    this.axiosAuth = new Axios({ baseURL: this.authProxyBaseUrl });
  }

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('/auth/linkedin')
  async auth(@Res({ passthrough: true }) res: Response) {
    try {
      const authorizationServerUrl = new URL(
        `${applicationConfig.linkedin.serverUrl}/authorization?response_type=code&client_id=${applicationConfig.linkedin.clientId}&scope=email,profile,openid&redirect_uri=${applicationConfig.linkedin.redirectUrl}`,
      );

      return res.redirect(authorizationServerUrl.toString());
    } catch (error) {
      throw new SomethingWentWrong();
    }
  }

  @Public()
  @Get('/auth/linkedin/callback')
  async redirectCallback(
    @Query('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const bodyData = {
      grant_type: 'authorization_code',
      code,
      redirect_uri: applicationConfig.linkedin.redirectUrl,
      client_id: applicationConfig.linkedin.clientId,
      client_secret: applicationConfig.linkedin.secret,
    };

    try {
      const accessTokenObject = await this.axiosAuth.post(
        '/accessToken',
        qs.stringify(bodyData),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );

      const linkedInAccessToken = JSON.parse(
        accessTokenObject.data,
      ).access_token;

      const linkedInUserData = await this.axiosAuth.get(
        applicationConfig.linkedin.userInfoUrl,
        {
          headers: {
            Authorization: `Bearer ${linkedInAccessToken}`,
          },
        },
      );

      const user = await this.userService.handleUser(
        JSON.parse(linkedInUserData.data),
      );

      if (!user?.isVerified) {
        throw new Unauthorized();
      }

      const { accessToken, expiresIn } = await generateJwt(
        { id: user.id, username: user.username },
        this.jwtService,
      );

      res.cookie('jwt_key', accessToken, {
        path: '/',
        domain: feDomain(),
      });

      res.redirect(feDomain());
    } catch (error: any) {
      console.error(error.response.data);
      throw new SomethingWentWrong();
    }
  }
}
