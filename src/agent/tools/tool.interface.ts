import { z } from 'zod';
import { Tool } from '@langchain/core/tools';

export abstract class BaseTool extends Tool {
  abstract name: string;
  abstract description: string;

  protected abstract _call(args: z.infer<this['schema']>): Promise<any>;

  async call(args: z.infer<this['schema']>): Promise<any> {
    try {
      return await this._call(args);
    } catch (error) {
      throw new Error(`Error executing tool ${this.name}: ${error.message}`);
    }
  }
}
