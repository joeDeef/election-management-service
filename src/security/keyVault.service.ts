import { Injectable, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jose from 'jose';

/**
 * Service for cryptographic operations
 * Manages JWE decryption and JWS verification for secure communication
 */
@Injectable()
export class KeyVaultService implements OnModuleInit {
  private readonly logger = new Logger(KeyVaultService.name);
  private readonly keyCache = new Map<string, any>();

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initializes cryptographic keys on module startup
   * Caches private and public keys for optimal performance
   */
  async onModuleInit() {
    try {
      await this.cacheKey('ELECTION_MGMT_PRIVATE_KEY_BASE64', 'private');
      await this.cacheKey('ELECTION_PUBLIC_KEY_BASE64', 'public');
      this.logger.log('Cryptographic keys loaded and cached successfully');
    } catch (error) {
      this.logger.error('Failed to load cryptographic keys', error.stack);
      throw error;
    }
  }

  /**
   * Caches cryptographic key from environment variable
   * @param envVar Environment variable name containing base64 encoded key
   * @param type Key type (private for decryption, public for verification)
   */
  private async cacheKey(envVar: string, type: 'private' | 'public') {
    const base64 = this.configService.get<string>(envVar);
    if (!base64) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
    
    try {
      const keyStr = Buffer.from(base64, 'base64').toString();
      const key = type === 'private' 
        ? await jose.importPKCS8(keyStr, 'RSA-OAEP-256') 
        : await jose.importSPKI(keyStr, 'PS256');
      
      this.keyCache.set(envVar, key);
      this.logger.log(`${type.charAt(0).toUpperCase() + type.slice(1)} key cached successfully`);
    } catch (error) {
      this.logger.error(`Failed to import ${type} key from ${envVar}`, error.stack);
      throw new Error(`Invalid ${type} key format in ${envVar}`);
    }
  }

  /**
   * Unpacks and verifies security envelope (JWE + JWS)
   * @param envelope Base64 encoded JWE containing JWS
   * @returns Decrypted and verified payload
   */
  async unpack(envelope: string) {
    try {
      const myPrivKey = this.keyCache.get('ELECTION_MGMT_PRIVATE_KEY_BASE64');
      const gatewayPubKey = this.keyCache.get('ELECTION_PUBLIC_KEY_BASE64');

      if (!myPrivKey || !gatewayPubKey) {
        throw new Error('Cryptographic keys not properly initialized');
      }

      // Decrypt JWE (Confidentiality)
      const { plaintext } = await jose.compactDecrypt(envelope, myPrivKey);
      const jws = new TextDecoder().decode(plaintext);

      // Verify JWS (Integrity and Authenticity)
      const { payload } = await jose.compactVerify(jws, gatewayPubKey);
      
      const decryptedData = JSON.parse(new TextDecoder().decode(payload));
      this.logger.log('Security envelope successfully unpacked and verified');
      return decryptedData;
    } catch (error) {
      this.logger.error(`Security envelope unpacking failed: ${error.message}`);
      throw new BadRequestException('Invalid or corrupted security envelope');
    }
  }
}