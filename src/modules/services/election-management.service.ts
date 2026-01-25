import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ElectionRepository } from '../repository/election.repository';
import { CreateElectionDataDto } from '../dto/data-election.dto';

/**
 * Service for managing election business logic
 * Orchestrates election and candidate operations through repository layer
 */
@Injectable()
export class ElectionManagementService {
  private readonly logger = new Logger(ElectionManagementService.name);

  constructor(private readonly repository: ElectionRepository) {}

  /**
   * Creates a new election with associated candidates
   * @param dto Election creation data
   * @returns Created election with candidates
   */
  async createElection(dto: CreateElectionDataDto) {
    try {
      this.logger.log(`Creating election: ${dto.nameElection} for date: ${dto.election_date}`);
      const result = await this.repository.createElectionWithCandidates(dto);
      this.logger.log(`Election created successfully with ${dto.candidatos.length} candidates`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create election: ${dto.nameElection}`, error.stack);
      throw new InternalServerErrorException('Failed to create election with candidates');
    }
  }

  /**
   * Retrieves today's elections with their candidates
   * @returns Elections and candidates for current date
   */
  async getElectionsWithCandidatesToday() {
    try {
      this.logger.log('Fetching today\'s elections with candidates');
      const result = await this.repository.findElectionsWithCandidatesToday();
      this.logger.log(`Found ${result?.length || 0} elections for today`);
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch today\'s elections', error.stack);
      throw new InternalServerErrorException('Failed to retrieve today\'s elections');
    }
  }

  /**
   * Retrieves all elections in the system
   * @returns List of all elections
   */
  async findAll() {
    try {
      this.logger.log('Fetching all elections');
      const result = await this.repository.findAllElections();
      this.logger.log(`Retrieved ${result?.length || 0} elections`);
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch all elections', error.stack);
      throw new InternalServerErrorException('Failed to retrieve elections');
    }
  }

  /**
   * Finds the election ID for today's date
   * @returns Election ID for current date
   */
  async findTodayElectionId() {
    try {
      this.logger.log('Fetching today\'s election ID');
      const result = await this.repository.findTodayElectionId();
      this.logger.log(`Today\'s election ID: ${result || 'none found'}`);
      return { id: result };
    } catch (error) {
      this.logger.error('Failed to fetch today\'s election ID', error.stack);
      throw new InternalServerErrorException('Failed to retrieve today\'s election ID');
    }
  }
}
