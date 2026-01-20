import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './providers/supabase/supabase.module';
import supabaseConfig from './config/supabase.config';
import { ElectionManagementModule } from './modules/election-managment/election-management.module';

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
