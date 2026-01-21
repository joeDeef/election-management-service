import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../../providers/supabase/supabase.service';
import { CreateElectionDto } from '../dto/create-election.dto';
import { Election } from '../entities/election.entity';
import { CreateCandidateDto } from '../dto/create-candidate.dto';
import { CreateElectionDataDto } from '../dto/data-election.dto';

@Injectable()
export class ElectionRepository {
  constructor(private readonly supabase: SupabaseService) { }
/*
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
 */
  async createElectionWithCandidates(dto: CreateElectionDataDto) {
    const client = this.supabase.getClient();

    // 1. Insertar la Elección
    const { data: election, error: electionError } = await client
      .from('elections')
      .insert([{
        name: dto.nameElection,
        election_date: dto.election_date
      }])
      .select()
      .single();

    if (electionError) {
      throw new InternalServerErrorException(`Error al crear elección: ${electionError.message}`);
    }

    // 2. Preparar candidatos vinculados
    // Si dto.candidatos sigue dando error, intenta: (dto as any).candidatos para debug,
    // pero lo correcto es que el DTO tenga la propiedad.
    const candidatesToInsert = dto.candidatos.map(c => ({
      name: c.name,
      political_group: c.political_group,
      election_id: election.id
    }));

    // 3. Inserción masiva de candidatos
    const { data: candidates, error: candidatesError } = await client
      .from('candidates')
      .insert(candidatesToInsert)
      .select();

    if (candidatesError) {
      // Nota: En producción podrías querer borrar la elección si esto falla (rollback manual)
      // o usar una RPC de PostgreSQL para transacciones reales.
      throw new InternalServerErrorException(`Error al registrar candidatos: ${candidatesError.message}`);
    }

    return {
      ...election,
      candidatos: candidates
    };
  }

  async findElectionsWithCandidatesToday() {
    const client = this.supabase.getClient();
    const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

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

    if (error) throw new InternalServerErrorException(error.message);
    return data; // Esto devuelve una lista de elecciones, cada una con su arreglo de candidatos
  }
}
