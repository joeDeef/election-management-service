import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Global() // Lo hacemos global para no tener que importarlo en cada módulo
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
