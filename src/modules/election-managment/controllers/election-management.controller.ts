import {
  Controller,
  Post,
  Get,
  UseGuards,
  Version,
  Body,
  Query,
} from '@nestjs/common';
import { ElectionManagementService } from '../services/election-management.service';
import { CreateElectionDto } from '../dto/create-election.dto';
import { CreateCandidateDto } from '../dto/create-candidate.dto';
import { SecurityHeadersGuard } from 'src/common/guards/internal-security.guard';

@Controller('election')
@UseGuards(SecurityHeadersGuard)
export class ElectionManagementController {
  constructor(private readonly electionService: ElectionManagementService) { }

  @Version('1')
  @Post()
  // Crea una nueva elección
  async create(@Body() createElectionDto: CreateElectionDto) {
    return await this.electionService.create(createElectionDto);
  }

  @Version('1')
  @Get()
  // Obtiene todas las elecciones
  async findAll() {
    return await this.electionService.findAll();
  }

  @Version('1')
  @Post('candidates')
  // Endpoint para crear un nuevo candidato
  async createCandidate(@Body() createCandidateDto: CreateCandidateDto) {
    return await this.electionService.createCandidate(createCandidateDto);
  }

  @Version('1')
  @Get('candidates/filter')
  // Endpoint para obtener candidatos por nombre de campaña
  async getByCampaign(@Query('name') name: string) {
    return await this.electionService.getCandidatesByCampaign(name);
  }

  @Version('1')
  @Get('candidates/filter')
  // Endpoint para obtener candidatos por ID de elección
  async getByCampaignByElectionID(@Query('election_id') election_id: string) {
    return await this.electionService.getCandidatesByElectionID(election_id);
  }

  @Version('1')
  @Get('candidates/today')
  // Endpoint para obtener candidatos de elecciones que ocurren hoy
  async getToday() {
    return await this.electionService.getCandidatesToday();
  }

  @Version('1')
  @Get('test')
  // Endpoint para obtener candidatos de elecciones que ocurren hoy
  async test() {
    return { message: 'Election Management Service is running' };
  }

}
