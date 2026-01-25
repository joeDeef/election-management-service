import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

const isString = IsString as unknown as () => PropertyDecorator;
const isNotEmpty = IsNotEmpty as unknown as () => PropertyDecorator;
const isOptional = IsOptional as unknown as () => PropertyDecorator;
const isDateString = IsDateString as unknown as () => PropertyDecorator;
const maxLength = MaxLength as unknown as (n: number) => PropertyDecorator;

export class CreateElectionDto {
  @isString()
  @isNotEmpty()
  @maxLength(100)
  name: string;

  //
  @isString()
  @isOptional()
  description?: string;

  @isDateString()
  @isNotEmpty()
  election_date: string;
}
