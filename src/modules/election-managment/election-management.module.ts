import { Module } from '@nestjs/common';
import { ElectionManagementController } from './controllers/election-management.controller';
import { ElectionManagementService } from './services/election-management.service';
import { ElectionRepository } from './repository/election.repository';
import { JwtModule } from '@nestjs/jwt';
import { SecurityHeadersGuard } from 'src/common/guards/internal-security.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ElectionManagementController],
  providers: [
    ElectionManagementService,
    ElectionRepository,
    SecurityHeadersGuard
  ],
})
export class ElectionManagementModule { }
