import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { ClientDto } from '../dto/client.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AuthService } from '../services/auth.service';
import { IdentityService } from '../services/identity.service';

@Controller('auth')
export class AuthController {

  constructor(
    private authService: AuthService,
    private readonly identityService: IdentityService,
  ) {}

  @Post('identity')
  async createClient(@Body() data: ClientDto, @Req() request: Request, @Res() response: Response) {
    const serviceResponse = await this.identityService.create(data);
    let statusCode: HttpStatus;

    if (serviceResponse.status === 422) {
      statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
      return response
        .status(statusCode)
        .send({
          statusCode,
          message: serviceResponse.description,
          errors: serviceResponse.errors,
        });
    }

    if (serviceResponse.status !== 201) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({
          statusCode,
          message: 'Something wrong happened. Please contact an administrator.',
        });
    }

    statusCode = HttpStatus.CREATED;
    return response
      .header('Location', `${request.url}/${serviceResponse.payload.client.id}`)
      .status(statusCode)
      .send({ id: serviceResponse.payload.client.id });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() request) {
    return this.authService.login(request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() request) {
    return request.user;
  }

}
