import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class SignatureGuard implements CanActivate {
  private readonly logger = new Logger(SignatureGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signatureBase64 = request.headers['x-signature'];
    const body = request.body;

    if (!signatureBase64) {
      throw new UnauthorizedException(
        'Firma ausente en el encabezado X-Signature',
      );
    }

    try {
      const rawBody = JSON.stringify(body);
      const publicKeyBase64 = this.configService.get<string>(
        'ELECTION_PUBLIC_KEY_BASE64',
      );
      if (!publicKeyBase64) {
        this.logger.error(
          'Variable ELECTION_PUBLIC_KEY_BASE64 no encontrada en .env',
        );
        throw new UnauthorizedException(
          'Clave pública no configurada en el servidor',
        );
      }
      this.logger.debug(`
        Llave Base64 recuperada: ${publicKeyBase64.substring(0, 15)}...`);
      const publicKey = Buffer.from(publicKeyBase64, 'base64').toString(
        'utf-8',
      );

      this.logger.debug('Llave decodificada correctamente. Contenido inicial:');
      console.log(publicKey);

      const verifier = crypto.createVerify('sha256');
      verifier.update(rawBody);
      verifier.end();

      const isVerified = verifier.verify(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        },
        signatureBase64,
        'base64'
      );

      if (!isVerified) {
        this.logger.warn('Firma digital no válida para la petición');
        throw new UnauthorizedException(
          'La integridad de los datos no pudo ser verificada',
        );
      }

      return true;
    } catch (error) {
      this.logger.error(`Error en verificación de firma: ${error.message}`);
      throw new UnauthorizedException('Error procesando la firma digital');
    }
  }
}
