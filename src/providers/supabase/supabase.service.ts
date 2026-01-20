import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient<any, any, any, any, any>;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!url || !key) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in configuration',
      );
    }

    this.supabaseClient = createClient(url, key);
  }

  // Método para obtener el cliente en otros servicios
  getClient() {
    return this.supabaseClient;
  }

  // Prueba de conectividad al arrancar
  async onModuleInit() {
    try {
      const { error } = await this.supabaseClient
        .from('candidates')
        .select('*')
        .limit(1);
      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        throw error;
      }
      this.logger.log('Conexión con Supabase establecida correctamente.');
    } catch (err: unknown) {
      let message: string;
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      } else {
        message = JSON.stringify(err);
      }
      this.logger.error(`❌ Error conectando a Supabase: ${message}`);
    }
  }
}
