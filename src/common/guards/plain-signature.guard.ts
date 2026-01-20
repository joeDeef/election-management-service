import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class SignatureVerificationGuard implements CanActivate {
  private readonly publicKey: string;
  private readonly logger = new Logger(SignatureVerificationGuard.name);

  constructor(private readonly configService: ConfigService) {
    const publicKeyBase64 = this.configService.get<string>(
      'ELECTION_PUBLIC_KEY_BASE64',
    );
    if (!publicKeyBase64) {
      throw new InternalServerErrorException(
        'Public key (ELECTION_PUBLIC_KEY_BASE64) not found in environment',
      );
    }
    this.publicKey = Buffer.from(publicKeyBase64, 'base64').toString('utf-8');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    this.logger.debug('Request headers: ' + JSON.stringify(request.headers));
    this.logger.debug('Request body: ' + JSON.stringify(request.body));
    this.logger.debug('Using public key: ' + this.publicKey.substring(0, 15) + '...');

    const signature = request.headers['x-signature'];
    this.logger.debug('Signature from header: ' + signature);
    const body = request.body;
    if (!signature) {
      throw new UnauthorizedException('Missing x-signature header');
    }
    try {
      const bodyString = JSON.stringify(body || {});
      console.log(bodyString);
      const isVerified = crypto.verify(
        'sha256',
        Buffer.from(bodyString),
        {
          key: this.publicKey,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
          saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
        },
        Buffer.from(signature, 'base64'),
      );
      this.logger.debug("Signature verification result: " + isVerified);

      if (!isVerified) {
        throw new UnauthorizedException(
          'Invalid signature: Data integrity could not be verified',
        );
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException(
        `Signature verification failed: ${error.message}`,
      );
    }
  }
}
