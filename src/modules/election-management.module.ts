import { Module } from '@nestjs/common';
import { ElectionManagementController } from './controllers/election-management.controller';
import { ElectionManagementService } from './services/election-management.service';
import { ElectionRepository } from './repository/election.repository';
import { JwtModule } from '@nestjs/jwt';
import { InternalApiKeyGuard } from 'src/guards/internalApiKey.guard';
import { EnvelopeOpenerInterceptor } from 'src/interceptors/envelopeOpener.interceptor';
import { KeyVaultService } from 'src/security/keyVault.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ElectionManagementController],
  providers: [
    ElectionManagementService,
    ElectionRepository,
    InternalApiKeyGuard,
    EnvelopeOpenerInterceptor,
    KeyVaultService
  ],
})
export class ElectionManagementModule { }
