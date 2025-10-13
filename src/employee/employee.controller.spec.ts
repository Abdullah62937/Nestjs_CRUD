import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

// ✅ Mocking the DatabaseAuthGuard (to avoid import issues during tests)
jest.mock('../auth/database-auth/database-auth.guard', () => ({
  DatabaseAuthGuard: jest.fn().mockImplementation(() => true),
}));

describe('EmployeeController', () => {
  let controller: EmployeeController;
  let service: EmployeeService;

  beforeEach(async () => {
    const mockEmployeeService = {
      signup: jest.fn().mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: 'Abdullah',
      }),
      login: jest.fn().mockResolvedValue({ access_token: 'fake-jwt-token' }),
      create: jest.fn().mockResolvedValue({
        id: 2,
        email: 'abc@example.com',
        name: 'Rida',
      }),
      fetch: jest.fn().mockResolvedValue([
        { id: 1, name: 'Abdullah' },
        { id: 2, name: 'Rida' },
      ]),
      fetchById: jest.fn().mockResolvedValue({ id: 1, name: 'Abdullah' }),
      update: jest.fn().mockResolvedValue({ id: 1, name: 'Updated Abdullah' }),
      delete: jest.fn().mockResolvedValue({ message: 'Employee deleted' }),
      search: jest.fn().mockResolvedValue([{ id: 3, name: 'Yousuf' }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeController],
      providers: [{ provide: EmployeeService, useValue: mockEmployeeService }],
    }).compile();

    controller = module.get<EmployeeController>(EmployeeController);
    service = module.get<EmployeeService>(EmployeeService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    console.log('✅ EmployeeController is defined!');
  });

  describe('signup', () => {
    it('should call EmployeeService.signup and return result', async () => {
      const dto = {
        email: 'test@example.com',
        password: '12345',
        name: 'Abdullah',
      };
      const result = await controller.signup(dto);

      console.log('🟢 Controller Signup Result:', result);

      expect(service.signup).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Abdullah',
      });
    });
  });

  describe('login', () => {
    it('should call EmployeeService.login and return token', async () => {
      const dto = { email: 'test@example.com', password: '12345' };
      const result = await controller.login(dto);

      console.log('🟢 Controller Login Result:', result);

      expect(service.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ access_token: 'fake-jwt-token' });
    });

    it('should throw UnauthorizedException if service throws', async () => {
      (service.login as jest.Mock).mockRejectedValueOnce(new UnauthorizedException());

      await expect(
        controller.login({ email: 'wrong', password: 'bad' }),
      ).rejects.toThrow(UnauthorizedException);

      console.log('🔴 Controller Login Error: Unauthorized');
    });
  });

  describe('fetch', () => {
    it('should return list of employees', async () => {
      const result = await controller.fetch();
      console.log('🟢 Controller Fetch Result:', result);

      expect(service.fetch).toHaveBeenCalled();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('fetchById', () => {
    it('should return employee if found', async () => {
      const result = await controller.fetchById(1);

      console.log('🟢 Controller FetchById Result:', result);

      expect(service.fetchById).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1, name: 'Abdullah' });
    });

    it('should throw NotFoundException if not found', async () => {
      (service.fetchById as jest.Mock).mockRejectedValueOnce(new NotFoundException());

      await expect(controller.fetchById(99)).rejects.toThrow(NotFoundException);

      console.log('🔴 Controller FetchById Error: Not Found');
    });
  });

  describe('update', () => {
    it('should call update and return updated employee', async () => {
      const dto = { name: 'Updated Abdullah' };
      const result = await controller.Update(1, dto);

      console.log('🟢 Controller Update Result:', result);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual({ id: 1, name: 'Updated Abdullah' });
    });
  });

  describe('delete', () => {
    it('should call delete and return message', async () => {
      const result = await controller.delete(1);
      console.log('🟢 Controller Delete Result:', result);

      expect(service.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Employee deleted' });
    });
  });

  describe('search', () => {
    it('should call search with name and dept', async () => {
      const result = await controller.search('Yousuf', 'IT');
      console.log('🟢 Controller Search Result:', result);

      expect(service.search).toHaveBeenCalledWith({ name: 'Yousuf', dept: 'IT' });
      expect(result).toEqual([{ id: 3, name: 'Yousuf' }]);
    });
  });
});
