import { Injectable, NotFoundException } from '@nestjs/common';
import { Block } from './block';
import * as storedBlocks from './blocks-store.json';
import { writeFileSync } from 'fs';
import { plainToClass } from 'class-transformer';

@Injectable()
export class Blockchain {
  chain: Block[];
  height: number;

  constructor() {
    this.chain = [];
    this.height = -1;
    this.initializeChain();
  }

  initializeChain() {
    if (storedBlocks.length > 0) {
      // loading from file
      this.loadFromBlocks(storedBlocks);
      return;
    }
    if (this.height === -1) {
      let block = new Block(); // genesis block
      block.setData({});
      this.addBlock(block);
    }
  }

  addBlock(block: Block) {
    const newHeight = this.height + 1;

    // 1. check current block height to assign previous block hash.
    if (this.height >= 0) {
      // set the previous block hash to "block"
      block.prevBlockHash = this.chain[this.height].hash;
    }
    // 2. assign correct height...
    block.height = newHeight;

    // 3. create block hash
    block.setTime(Date.now());
    block.computeBlockHash(); // MINE

    // 4. update blockchain height and push the new block
    this.chain.push(block); // broadcast
    this.height = newHeight;

    this.persist();
  }

  loadFromBlocks(blocks: any[]) {
    blocks.forEach(block => this.chain.push(plainToClass(Block, block)));
    this.height = this.chain.length - 1;
  }

  getBlockByHeight(height: number): Block {
    const block = this.chain[height];
    if (!block) throw new NotFoundException('Block not found');
    return block;
  }

  async validateBlock(height: number): Promise<Boolean> {
    return this.getBlockByHeight(height).validate();
  }

  findInData(searchFunction: Function): Block {
    return this.chain.find(({ data }) => searchFunction(data));
  }

  validate(): Boolean {
    return !this.chain.some((block: Block, height: number, chain: Block[]) => {
      let validRef = true;
      if (height !== 0) {
        // if it is not the genesis block
        validRef = block.prevBlockHash === chain[height - 1].hash;
      }
      return !block.validate() || !validRef;
    });
  }

  private persist() {
    writeFileSync(
      './src/blockchain/blocks-store.json',
      JSON.stringify(this.chain),
    );
  }
}
