import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException, Logger } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { KeyVaultService } from '../security/keyVault.service';

/**
 * Interceptor for decrypting security envelopes
 * Handles JWE/JWS decryption and validation from x-security-envelope header
 */
@Injectable()
export class EnvelopeOpenerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(EnvelopeOpenerInterceptor.name);

  constructor(private readonly securityService: KeyVaultService) {}

  /**
   * Intercepts requests to decrypt security envelope and inject decrypted data
   * @param context Execution context
   * @param next Call handler for next interceptor/controller
   * @returns Observable with decrypted data injected into request
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const type = context.getType();
    let envelope: string;
    let dataTarget: any;

    // Extract envelope based on context type
    if (type === 'http') {
      const request = context.switchToHttp().getRequest();
      envelope = request.headers['x-security-envelope'];
      if (!request.body) request.body = {};
      dataTarget = request.body;
    } else {
      const rpcData = context.switchToRpc().getData();
      envelope = rpcData?.headers?.['x-security-envelope'];
      dataTarget = rpcData;
    }

    if (!envelope) {
      throw new BadRequestException('Falta x-security-envelope en los headers');
    }

    return from(this.securityService.unpack(envelope)).pipe(
      switchMap((decryptedData) => {
        try {
          // Parse decrypted data if it's a string
          let finalData = decryptedData;
          if (typeof decryptedData === 'string') {
            finalData = JSON.parse(decryptedData);
          }

          // Clean existing properties and inject decrypted data
          Object.keys(dataTarget).forEach(key => delete dataTarget[key]);
          if (dataTarget.data) delete dataTarget.data;
          Object.assign(dataTarget, finalData);
          
          this.logger.log('Security envelope successfully decrypted and data injected');
          return next.handle();
        } catch (error) {
          this.logger.error('Failed to process decrypted data', error.stack);
          throw new BadRequestException('Invalid decrypted data format');
        }
      })
    );
  }
}