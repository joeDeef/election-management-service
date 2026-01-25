import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCandidateDto {
  @IsUUID()
  @IsNotEmpty()
  election_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  political_group: string;

  @IsString()
  @IsOptional()
  description?: string;
}
