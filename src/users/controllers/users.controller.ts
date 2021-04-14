import { Controller, Get, HttpStatus, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from '../services/users.service';

export interface GetUsersQuery {
  search: string;
}

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUsers(@Query() query: GetUsersQuery, @Res() response: Response) {
    const serviceResponse = await this.usersService.findUsersByKeyword(
      query.search,
    );
    
    let statusCode: HttpStatus;
    if (serviceResponse.status === 400) {
      statusCode = HttpStatus.BAD_REQUEST;
      return response.status(statusCode).send({
        statusCode,
        message: serviceResponse.description,
        errors: serviceResponse.errors,
      });
    }

    if (serviceResponse.status !== 200) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      return response.status(statusCode).send({
        statusCode,
        message: 'Something wrong happened. Please contact an administrator.',
      });
    }

    statusCode = HttpStatus.OK;
    return response.status(statusCode).send(serviceResponse.payload.users);
  }
}
