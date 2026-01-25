import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Service for Supabase database client management
 * Handles connection initialization and provides client access to repositories
 */
@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient<any, any, any, any, any>;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !key) {
      const missingVars: string[] = [];
      if (!url) missingVars.push('SUPABASE_URL');
      if (!key) missingVars.push('SUPABASE_SERVICE_ROLE_KEY');
      
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    this.supabaseClient = createClient(url, key);
  }

  /**
   * Provides access to the Supabase client instance
   * @returns Configured Supabase client
   */
  getClient() {
    return this.supabaseClient;
  }

  /**
   * Tests database connectivity on module initialization
   * Performs a lightweight query to verify connection
   */
  async onModuleInit() {
    try {
      const { error } = await this.supabaseClient
        .from('candidates')
        .select('*')
        .limit(1);
        
      // Ignore specific "table not found" errors during development
      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        throw error;
      }
      
      this.logger.log('Supabase database connection established successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to connect to Supabase database: ${message}`);
      throw new Error(`Database connection failed: ${message}`);
    }
  }
}
