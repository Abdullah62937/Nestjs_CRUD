import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from './employee.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee } from './entity.employee';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

// ✅ FIX: Mock bcrypt before tests
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('EmployeeService', () => {
  let service: EmployeeService;
  let repository: Repository<Employee>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('fake-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    repository = module.get<Repository<Employee>>(getRepositoryToken(Employee));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should hash password and save employee', async () => {
      const data = { email: 'test@example.com', password: '12345',name:'Test' };

      (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashedPassword');
      repository.create = jest.fn().mockReturnValue({ email: data.email, password: 'hashedPassword' });
      repository.save = jest.fn().mockResolvedValueOnce({ id: 1, email: data.email });

      const result = await service.signup(data);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });
  });

  describe('login', () => {
    it('should return token if credentials are valid', async () => {
      const user = { id: 1, email: 'a@a.com', password: 'hashedPassword' };
      repository.findOne = jest.fn().mockResolvedValueOnce(user);

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login({ email: 'a@a.com', password: '123' });
      expect(result).toHaveProperty('access_token');
    });

    it('should throw error if user not found', async () => {
      repository.findOne = jest.fn().mockResolvedValueOnce(null);
      await expect(service.login({ email: 'a@a.com', password: '123' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('fetchById', () => {
    it('should return employee if found', async () => {
      repository.findOneBy = jest.fn().mockResolvedValueOnce({ id: 1, name: 'Abdullah' });
      const result = await service.fetchById(1);
      expect(result).toHaveProperty('id');
    });

    it('should throw NotFoundException if not found', async () => {
      repository.findOneBy = jest.fn().mockResolvedValueOnce(null);
      await expect(service.fetchById(1)).rejects.toThrow(NotFoundException);
    });
  });
});
