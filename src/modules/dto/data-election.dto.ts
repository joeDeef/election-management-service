import { IsString, IsArray, ValidateNested, IsDateString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for candidate information within an election
 */
class CandidateInsideDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  political_group: string;
}

/**
 * DTO for creating a complete election with candidates
 */
export class CreateElectionDataDto {
  @IsString()
  @IsNotEmpty()
  nameElection: string;

  @IsDateString()
  @IsNotEmpty()
  election_date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CandidateInsideDto)
  candidatos: CandidateInsideDto[];
}