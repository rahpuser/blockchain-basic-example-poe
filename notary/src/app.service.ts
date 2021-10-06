import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Block } from './blockchain/block';
import { Blockchain } from './blockchain/blockchain';
import { createHash } from 'crypto';
import { ec } from 'elliptic';

@Injectable()
export class AppService {
  constructor(private readonly blockchain: Blockchain) {}

  getBlockByHeight(height: number): Block {
    return this.blockchain.getBlockByHeight(height);
  }
  async validateBlock(height: number): Promise<Boolean> {
    return this.blockchain.validateBlock(height);
  }

  submitDocument(message: string, signature: string): Block {
    const [address, shaFile, time] = message.split(':');
    // 1.0. validate signature
    const g = new ec('secp256k1');
    const keyPair = g.keyFromPublic(address, 'hex');

    const hexMessage = Buffer.from(message, 'utf8').toString('hex');
    const valid = keyPair.verify(hexMessage, Buffer.from(signature, 'base64'));

    if (!valid) throw new BadRequestException('Invalid signature');

    // 1.1 verify file doesn't already exist
    const foundBlock = this.blockchain.findInData(
      ({ shaFile: blockChainSha }) => blockChainSha === shaFile,
    );

    if (foundBlock)
      throw new ConflictException('File already exist in the blockchain');

    // 2. create block
    const block = new Block();
    block.data = {
      address,
      shaFile,
      time,
      signature,
    };

    // 3. add block

    this.blockchain.addBlock(block);

    return block;
  }
  requestSubmission(address: string, file: Express.Multer.File): string {
    // sha256 the file and not storing it
    const shaFile = createHash('sha256')
      .update(file.buffer)
      .digest('hex');

    // 1. verify file doesn't already exist
    const block = this.blockchain.findInData(
      ({ shaFile: blockChainSha }) => blockChainSha === shaFile,
    );

    if (block)
      throw new ConflictException('File already exist in the blockchain');
    const time = Date.now();

    return `${address}:${shaFile}:${time}:docSubmission`;
  }

  verifyDocument(file: Express.Multer.File): Block {
    // 1. convert file to sha256
    const shaFile = createHash('sha256')
      .update(file.buffer)
      .digest('hex');

    const block = this.blockchain.findInData(
      ({ shaFile: blockChainSha }) => blockChainSha === shaFile,
    );

    if (!block) throw new NotFoundException('Block not found');

    return block;
  }
  validateBlockchain(): Boolean {
    return this.blockchain.validate();
  }
}
