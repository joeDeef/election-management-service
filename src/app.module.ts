import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import supabaseConfig from './config/supabase.config';
import { ElectionManagementModule } from './modules/election-management.module';

/**
 * Root application module
 * Configures global modules and dependencies for election management
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [supabaseConfig],
    }),
    SupabaseModule,
    ElectionManagementModule,
  ],
})
export class AppModule {}
