import { Tool } from '@langchain/core/tools';

export class CalculatorTool extends Tool {
  name = 'calculator';
  description = 'Performs basic arithmetic operations (add, subtract, multiply, divide)';

  constructor() {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      // Parse input string like "add 5 3" or "multiply 6 4"
      const [operation, a, b] = input.split(' ');
      const num1 = parseFloat(a);
      const num2 = parseFloat(b);

      if (isNaN(num1) || isNaN(num2)) {
        throw new Error('Invalid numbers provided');
      }

      let result: number;
      switch (operation.toLowerCase()) {
        case 'add':
          result = num1 + num2;
          break;
        case 'subtract':
          result = num1 - num2;
          break;
        case 'multiply':
          result = num1 * num2;
          break;
        case 'divide':
          if (num2 === 0) {
            throw new Error('Division by zero is not allowed');
          }
          result = num1 / num2;
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      return result.toString();
    } catch (error) {
      throw new Error(`Error executing calculator: ${error.message}`);
    }
  }
}
