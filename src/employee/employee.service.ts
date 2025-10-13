import { Body, Inject, Injectable, NotFoundException, Param, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from './entity.employee';
import { BSON, Repository } from 'typeorm';
import { promises } from 'dns';
import { NotFoundError } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class EmployeeService {
    constructor(@InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private jwtService: JwtService, ) { }

    async signup(data: { email: string; password: string }) {
    const hashed = await bcrypt.hash(data.password, 10);
    const employee = this.employeeRepository.create({
      email: data.email, 
      dept: 'auth',     
      password: hashed, 
    } as any);
    return this.employeeRepository.save(employee);
  }

 
  async login(data: { email: string; password: string }) {
    const employee = await this.employeeRepository.findOne({
      where: { email: data.email } 
    });

    if (!employee) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(data.password, (employee as any).password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: employee.id, email: data.email };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }

    async create(employeeData: Partial<Employee>): Promise<Employee> {
        const employee = this.employeeRepository.create(employeeData);
        return this.employeeRepository.save(employee);
    }



    async fetch(): Promise<Employee[]> {
        return this.employeeRepository.find();

    }

    async fetchById(id: number): Promise<Employee> {
        const employee = await this.employeeRepository.findOneBy({ id });
        if (!employee) { 
            throw new NotFoundException('Employee Not Found');
        }
        return employee;
    }

    async update(id:number,updatedData:Partial<Employee>):Promise<Employee>{
        const employee = await this.employeeRepository.findOneBy({id});
        if(!employee){
            throw new NotFoundException('Not Found');
        }
        const updated = Object.assign(employee,updatedData);
        return this.employeeRepository.save(updated);
    }

    async delete(id:number):Promise<{message: string}>{
        const result = await this.employeeRepository.delete(id);
        if(result.affected === 0){
            throw new NotFoundException('Not Found');
        }
        return {message:`Employee with ID ${id} is deleted`};
    }
    async search(filters:{
        name?:string; 
        dept?:string
    }):Promise<Employee[]>{
        const query = this.employeeRepository.createQueryBuilder('employee');
        if(filters.name){
            query.andWhere('employee.name ILIKE :name',
                {name: `%${filters.name}%`}
            )
        }
        if(filters.dept){
            query.andWhere(`employee.dept = :dept`,

                {dept:filters.dept}
            )
        }
        return query.getMany();
    }
}
