import { Controller, Get, HttpStatus, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/application/auth/guards/jwt-auth.guard';
import { FindUsersQuery, UsersService } from '../services/users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUsers(@Query() query: FindUsersQuery, @Res() response: Response) {
    const serviceResponse = await this.usersService.findUsers(query);
    
    let statusCode: HttpStatus;
    if (serviceResponse.status === 400) {
      statusCode = HttpStatus.BAD_REQUEST;
      return response.status(statusCode).send({
        statusCode,
        message: serviceResponse.description,
        errors: serviceResponse.errors,
      });
    }

    if (serviceResponse.status !== 200 && serviceResponse.status !== 206) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      return response.status(statusCode).send({
        statusCode,
        message: 'Something wrong happened. Please contact an administrator.',
      });
    }

    statusCode = HttpStatus.OK;
    if (serviceResponse.status === 206) {
      statusCode = HttpStatus.PARTIAL_CONTENT;
    }
    return response.status(statusCode).send(serviceResponse.payload);
  }
}
