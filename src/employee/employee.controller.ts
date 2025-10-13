import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { Employee } from './entity.employee';
import { DatabaseAuthGuard } from 'src/auth/database-auth/database-auth.guard';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';


@Controller('employee')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) { }


    @Post('signup')
      @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'mypassword' },
        name: { type: 'string', example: 'John Doe' },
      },
      required: ['email', 'password', 'name'],
    },
  })
    async signup(@Body() body: { email: string; password: string,name:string, }) {
        return this.employeeService.signup(body);
    }

  
    @Post('login')
    @ApiBody({
        schema:{
            type: 'object',
            properties:{
                email:{type:'string',example:'example@example.com'},
                password:{type:'string', example:'Example'}
            },
            required:['email','password']
        },
    })
    async login(@Body() body: { email: string; password: string }) {
        return this.employeeService.login(body);
    }

    @Post()
    async createEmployee(@Body() body: Partial<Employee>): Promise<Employee> {
        return this.employeeService.create(body);
    }

    @UseGuards(DatabaseAuthGuard)
    @ApiBearerAuth('access-token')
    @Get()
    async fetch(): Promise<Employee[]> {
        return this.employeeService.fetch();
    }

    @Get('search')
    async search(@Query('name') name: string, @Query('dept') dept: string): Promise<Employee[]> {
        return this.employeeService.search({ name, dept });
    }

    @Get(':id')
    async fetchById(@Param('id') id: number): Promise<Employee> {
        return this.employeeService.fetchById(id);
    }

    @Put(':id')
    async Update(
        @Param('id') id: number,
        @Body() body: Partial<Employee>): Promise<Employee> {
        return this.employeeService.update(id, body);
    }

    @Delete(':id')
    async delete(
        @Param('id') id: number
    ): Promise<{ message: string }> {
        return this.employeeService.delete(id);
    }



}
