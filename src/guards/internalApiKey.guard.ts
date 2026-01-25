import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Guard for internal API key validation
 * Protects endpoints from unauthorized access by validating x-api-key header
 */
@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Validates API key from request headers
   * @param context Execution context containing request data
   * @returns true if API key is valid, throws UnauthorizedException otherwise
   */
  canActivate(context: ExecutionContext): boolean {
    const rpcData = context.switchToRpc().getData();
    const headers = rpcData?.headers;

    const expectedApiKey = this.configService.get<string>('API_KEY');
    if (!headers || headers['x-api-key'] !== expectedApiKey) {
      throw new UnauthorizedException('Acceso denegado: API Key inválida');
    }

    return true;
  }
}