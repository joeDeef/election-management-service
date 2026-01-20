import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../../providers/supabase/supabase.service';
import { CreateElectionDto } from '../dto/create-election.dto';
import { Election } from '../entities/election.entity';
import { CreateCandidateDto } from '../dto/create-candidate.dto';

@Injectable()
export class ElectionRepository {
  constructor(private readonly supabase: SupabaseService) {}

  async createElection(
    createElectionDto: CreateElectionDto,
  ): Promise<Election> {
    const client = this.supabase.getClient();
    const response = await client
      .from('elections')
      .insert([createElectionDto])
      .select()
      .single();

    const { data, error } = response as {
      data: Election | null;
      error: { message: string } | null;
    };

    if (error) {
      throw new InternalServerErrorException(
        `Error en Supabase: ${error.message}`,
      );
    }

    if (!data) {
      throw new InternalServerErrorException(
        'No election returned from Supabase',
      );
    }

    return data;
  }

  async findAllElections(): Promise<Election[]> {
  const client = this.supabase.getClient();  
  const { data, error } = await client
      .from('elections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(
        `Error consultando elecciones: ${error.message}`,
      );
    }

    return data;
  }

  async createCandidate(createCandidateDto: CreateCandidateDto) {
    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('candidates')
      .insert([createCandidateDto])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new BadRequestException(
          'Este candidato ya está registrado en esta elección.',
        );
      }
      throw new InternalServerErrorException(
        `Error en Supabase: ${error.message}`,
      );
    }

    return data;
  }

  async findCandidatesByElectionName(electionName: string) {
    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('candidates')
      .select(
        `
        *,
        elections!inner(name)
      `,
      )
      .ilike('elections.name', `%${electionName}%`);

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findCandidatesByElectionID(electionId: string) {
    const client = this.supabase.getClient();
    const { data, error } = await client
      .from('candidates')
      .select(
        `
        *,
        elections!inner(id)
      `,
      )
      .ilike('elections.id', `%${electionId}%`);

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async findCandidatesByElectionDate(date: string) {
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('candidates')
      .select(
        `
        *,
        elections!inner(election_date)
      `,
      )
      .eq('elections.election_date', date);

    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
