import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityHeadersGuard implements CanActivate {
  // Instanciamos el Logger con un contexto específico para identificarlo en consola
  private readonly logger = new Logger('SecurityGuard');

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;

    // 1. Extraer headers
    const apiKey = request.headers['x-api-key'];
    const token = request.headers['x-internal-token'];

    // 2. Validación de API Key
    const expectedApiKey = this.configService.get<string>('API_KEY');
    if (!apiKey || apiKey !== expectedApiKey) {
      this.logger.error(
        `[AUDITORÍA] Intento de acceso fallido: API Key inválida o ausente. IP: ${ip} - ${method} ${url}`
      );
      throw new UnauthorizedException('Acceso denegado: Credencial de servicio inválida');
    }

    // 3. Validación de JWT (Capa de Autenticidad)
    if (!token) {
      this.logger.warn(
        `[AUDITORÍA] Petición sin firma de identidad (token ausente). IP: ${ip} - ${method} ${url}`
      );
      throw new UnauthorizedException('Acceso denegado: No se encontró firma de identidad');
    }

    try {
      const base64Key = this.configService.get<string>('ELECTION_PUBLIC_KEY_BASE64');

      if (!base64Key) {
        this.logger.fatal('CONFIG ERROR: ELECTION_PUBLIC_KEY_BASE64 no definida en el entorno.');
        throw new UnauthorizedException('Error interno de configuración de seguridad.');
      }
      const publicKey = Buffer.from(base64Key, 'base64').toString('utf-8');

      await this.jwtService.verifyAsync(token, {
        publicKey: publicKey,
        algorithms: ['RS256'],
      });

      // Si todo sale bien, registramos el éxito para trazabilidad
      this.logger.log(`[ACCESO PERMITIDO] Identidad verificada para ${method} ${url}`);
      return true;

    } catch (error) {
      this.logger.error(
        `[AUDITORÍA] Firma de identidad inválida o expirada. IP: ${ip} - Motivo: ${error.message}`
      );
      throw new UnauthorizedException('Acceso denegado: Firma de identidad inválida o expirada');
    }
  }
}