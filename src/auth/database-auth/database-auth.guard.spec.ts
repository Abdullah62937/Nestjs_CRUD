import { ConfigService } from '@nestjs/config';
import { DatabaseAuthGuard } from './database-auth.guard';

describe('DatabaseAuthGuard', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
  });

  it('should be defined', () => {
    const guard = new DatabaseAuthGuard(configService);
    expect(guard).toBeDefined();
  });
});
