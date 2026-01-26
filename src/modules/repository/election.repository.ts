import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Election } from '../entities/election.entity';
import { CreateElectionDataDto } from '../dto/data-election.dto';

/**
 * Repository for election data access operations
 * Handles all database interactions for elections and candidates
 */
@Injectable()
export class ElectionRepository {
  private readonly logger = new Logger(ElectionRepository.name);

  constructor(private readonly supabase: SupabaseService) { }

  /**
   * Retrieves all elections ordered by creation date
   * @returns List of all elections
   */
  async findAllElections(): Promise<any[]> {
    try {
      const client = this.supabase.getClient();

      // 🔗 Hacemos el join con la tabla 'candidates'
      const { data, error } = await client
        .from('elections')
        .select(`
        id,
        name,
        description,
        election_date,
        created_at,
        candidates (
          name,
          political_group
        )
      `)
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error(`Database error: ${error.message}`);
        throw new InternalServerErrorException(`Error: ${error.message}`);
      }

      // 🧹 Mapeamos para que la propiedad se llame 'candidatos' en lugar de 'candidates'
      // y devolvemos la estructura limpia
      return data.map(election => ({
        name: election.name,
        description: election.description,
        election_date: election.election_date,
        created_at: election.created_at,
        candidatos: election.candidates // Supabase devuelve un array aquí
      }));

    } catch (error) {
      this.logger.error('Unexpected error fetching elections', error.stack);
      throw new InternalServerErrorException('Failed to fetch elections');
    }
  }

  /**
   * Creates a new election with associated candidates in a transactional manner
   * @param dto Election and candidates data
   * @returns Created election with candidates
   */
  async createElectionWithCandidates(dto: CreateElectionDataDto) {
    const client = this.supabase.getClient();

    try {
      this.logger.log(`Creating election: ${dto.nameElection} with ${dto.candidatos.length} candidates`);

      // Create election first
      const { data: election, error: electionError } = await client
        .from('elections')
        .insert([{
          name: dto.nameElection,
          election_date: dto.election_date
        }])
        .select()
        .single();

      if (electionError) {
        this.logger.error(`Failed to create election: ${electionError.message}`);
        throw new InternalServerErrorException(`Error al crear elección: ${electionError.message}`);
      }

      // Prepare candidates linked to election
      const candidatesToInsert = dto.candidatos.map(candidate => ({
        name: candidate.name,
        political_group: candidate.political_group,
        election_id: election.id
      }));

      // Insert candidates in batch
      const { data: candidates, error: candidatesError } = await client
        .from('candidates')
        .insert(candidatesToInsert)
        .select();

      if (candidatesError) {
        this.logger.error(`Failed to create candidates, rolling back election: ${candidatesError.message}`);
        // Manual rollback - delete the created election
        await client.from('elections').delete().eq('id', election.id);
        throw new InternalServerErrorException(`Error al registrar candidatos: ${candidatesError.message}`);
      }

      this.logger.log(`Successfully created election ${election.id} with ${candidates.length} candidates`);
      return {
        ...election,
        candidatos: candidates
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('Unexpected error creating election with candidates', error.stack);
      throw new InternalServerErrorException('Failed to create election with candidates');
    }
  }

  /**
   * Finds today's elections with their associated candidates
   * Uses Ecuador timezone for date comparison
   * @returns Elections with candidates for today's date
   */
  async findElectionsWithCandidatesToday() {
    try {
      const client = this.supabase.getClient();
      const today = this.getEcuadorDate();

      this.logger.log(`Querying elections for today in Ecuador: ${today}`);

      const { data, error } = await client
        .from('elections')
        .select(`
        id,
        name,
        election_date,
        candidates (
          id,
          name,
          political_group
        )
      `)
        .eq('election_date', today);

      if (error) {
        this.logger.error(`Database error fetching today's elections: ${error.message}`);
        throw new InternalServerErrorException(error.message);
      }

      this.logger.log(`Found ${data?.length || 0} elections for today with candidates`);
      return data;
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('Unexpected error fetching today\'s elections', error.stack);
      throw new InternalServerErrorException('Failed to fetch today\'s elections');
    }
  }

  /**
   * Finds the election ID for today's date
   * @returns Election ID or null if no election found for today
   */
  async findTodayElectionId(): Promise<number | string | null> {
    try {
      const client = this.supabase.getClient();
      const today = this.getEcuadorDate();

      this.logger.log(`Searching for election ID on date: ${today}`);

      const { data, error } = await client
        .from('elections')
        .select('id')
        .eq('election_date', today)
        .maybeSingle();

      if (error) {
        this.logger.error(`Database error fetching today's election ID: ${error.message}`);
        throw new InternalServerErrorException(error.message);
      }

      const electionId = data ? data.id : null;
      this.logger.log(`Today's election ID: ${electionId || 'none found'}`);
      return electionId;
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('Unexpected error fetching today\'s election ID', error.stack);
      throw new InternalServerErrorException('Failed to fetch today\'s election ID');
    }
  }

  /**
   * Gets current date in Ecuador timezone formatted as YYYY-MM-DD
   * @returns Date string in Ecuador timezone
   */
  private getEcuadorDate(): string {
    return new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Guayaquil'
    });
  }


}
