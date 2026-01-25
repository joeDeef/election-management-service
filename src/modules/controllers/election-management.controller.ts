import {
  Controller,
  Post,
  Get,
  UseGuards,
  Version,
  Body,
  UseInterceptors,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ElectionManagementService } from '../services/election-management.service';
import { CreateElectionDataDto } from '../dto/data-election.dto';
import { InternalApiKeyGuard } from 'src/guards/internalApiKey.guard';
import { EnvelopeOpenerInterceptor } from 'src/interceptors/envelopeOpener.interceptor';

/**
 * Controller for managing election operations
 * Handles CRUD operations for elections and candidate management
 * Protected by internal API key guard and envelope opener interceptor
 */
@Controller('election')
@UseGuards(InternalApiKeyGuard)
@UseInterceptors(EnvelopeOpenerInterceptor)
export class ElectionManagementController {
  private readonly logger = new Logger(ElectionManagementController.name);

  constructor(private readonly electionService: ElectionManagementService) {}
  /**
   * Retrieves today's active election with candidates
   * @returns Election data with candidates for current date
   */
  @Version('1')
  @Get('today')
  async getToday() {
    try {
      this.logger.log('Retrieving today\'s election with candidates');
      const result = await this.electionService.getElectionsWithCandidatesToday();
      this.logger.log(`Successfully retrieved today's election data`);
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve today\'s election', error.stack);
      throw new HttpException(
        'Unable to retrieve today\'s election data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Creates a new election with candidates
   * @param dto Election creation data including name, date, and candidates
   * @returns Created election with candidates
   */
  @Version('1')
  @Post('create')
  async createElection(@Body() dto: CreateElectionDataDto) {
    try {
      this.logger.log(`Creating new election: ${dto.nameElection}`);
      const result = await this.electionService.createElection(dto);
      this.logger.log(`Successfully created election: ${dto.nameElection}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create election: ${dto.nameElection}`, error.stack);
      throw new HttpException(
        'Unable to create election',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves all elections in the system
   * @returns List of all elections
   */
  @Version('1')
  @Get('findAll')
  async findAll() {
    try {
      this.logger.log('Retrieving all elections');
      const result = await this.electionService.findAll();
      this.logger.log(`Successfully retrieved ${result?.length || 0} elections`);
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve all elections', error.stack);
      throw new HttpException(
        'Unable to retrieve elections',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves the ID of today's election
   * @returns Election ID for current date
   */
  @Version('1')
  @Get('electionId')
  async findTodayElectionId() {
    try {
      this.logger.log('Retrieving today\'s election ID');
      const result = await this.electionService.findTodayElectionId();
      this.logger.log(`Successfully retrieved election ID: ${result?.id || 'none'}`);
      return result;
    } catch (error) {
      this.logger.error('Failed to retrieve today\'s election ID', error.stack);
      throw new HttpException(
        'Unable to retrieve today\'s election ID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
