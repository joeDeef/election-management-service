/**
 * Election entity representing database structure
 * Defines the data model for election records
 */
export class Election {
  /** Unique identifier for the election */
  id: string;
  
  /** Name of the election */
  name: string;
  
  /** Optional description of the election */
  description?: string;
  
  /** Date when the election takes place */
  election_date: Date;
  
  /** Timestamp when the election was created */
  created_at: Date;
}
