import {
  Controller,
  Post,
  Get,
  UseGuards,
  Version,
  Body,
} from '@nestjs/common';
import { ElectionManagementService } from '../services/election-management.service';
import { SecurityHeadersGuard } from 'src/common/guards/internal-security.guard';
import { CreateElectionDataDto } from '../dto/data-election.dto';

@Controller('election')
@UseGuards(SecurityHeadersGuard)
export class ElectionManagementController {
  constructor(private readonly electionService: ElectionManagementService) { }

  // 1. Crear Elección con Candidatos (Todo en uno)
  @Version('1')
  @Post('create')
  async createElection(@Body() dto: CreateElectionDataDto) {
    return await this.electionService.createElection(dto);
  }

  // 2. Obtener la elección activa de HOY con sus candidatos
  @Version('1')
  @Get('today')
  async getToday() {
    return await this.electionService.getElectionsWithCandidatesToday();
  }

  @Version('1')
  @Get('test')
  async test() {
    return { message: 'Election Management Service is running' };
  }
}