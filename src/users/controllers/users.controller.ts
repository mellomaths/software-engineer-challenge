import { Controller, Get, Query } from '@nestjs/common';

export interface GetUsersQuery {
    search: string;
}

@Controller('users')
export class UsersController {

    @Get()
    getUsers(@Query() query: GetUsersQuery) {
        return query.search
    }
}
