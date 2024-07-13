import { Order } from './enums';

export interface PaginationFilters {
  limit?: number;
  offset?: number;
  createdAtOrder?: Order;
}

export class CustomError extends Error {
  message: string;
  code: string;
  errorMessage: string;
  constructor(message: string, code: string, errorMessage: string) {
    super(message);
    this.message = message;
    this.code = code;
    this.errorMessage = errorMessage;
  }
}
