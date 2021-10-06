import * as crypto from 'crypto';

export class Block {
  nonce: number;
  hash: string;
  height: number;
  data: object;
  time: number;
  prevBlockHash: string;

  constructor() {
    this.nonce = 0;
    this.hash = '';
    this.height = 0;
    this.data = {};
    this.time = 0;
    this.prevBlockHash = '';
  }

  setData(data: object) {
    this.data = data;
  }

  setTime(time: number) {
    this.time = time;
  }

  validate(): Boolean {
    // Recalculate the hash of the Block
    const upToDateHash = this.computeHash(this.serializeWithoutHash());

    // Comparing if the hashes changed
    return this.hash === upToDateHash;
  }

  computeBlockHash() {
    // MIMIC PROOF OF WORK
    this.nonce = -1;
    while (this.hash.substring(0, 4) !== '2021') {
      this.nonce++;
      const stringHashInput = this.serializeWithoutHash();
      this.hash = this.computeHash(stringHashInput);
    }
  }

  serialize() {
    return JSON.stringify(this);
  }

  private computeHash(input: string) {
    return this.SHA256(input).toString();
  }

  private serializeWithoutHash() {
    return JSON.stringify({ ...this, hash: undefined });
  }

  private SHA256(input: string) {
    return crypto
      .createHash('sha256')
      .update(input)
      .digest('hex');
  }
}
