export enum SystemErrorCode {
  UNAUTHORIZED_ACCESS = 'ERR_AUTH_1001',
  INVALID_CREDENTIALS = 'ERR_AUTH_1002',
  STUDENT_NOT_FOUND = 'ERR_STUDENT_2001',
  DUPLICATE_ROLL_NUMBER = 'ERR_STUDENT_2002',
  PASS_NOT_ACTIVE = 'ERR_PASS_3001',
  ACTIVE_PASS_EXISTS = 'ERR_PASS_3002',
  INVALID_PAYMENT_AMOUNT = 'ERR_PAY_4001',
  PAYMENT_VERIFICATION_FAILED = 'ERR_PAY_4002',
  ROUTE_CAPACITY_EXCEEDED = 'ERR_ROUTE_5001',
  FILE_SIZE_EXCEEDED = 'ERR_FILE_6001',
  UNSUPPORTED_FILE_FORMAT = 'ERR_FILE_6002',
  SYSTEM_DATABASE_ERROR = 'ERR_SYS_9001',
}

export interface StandardizedBackendResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errorCode?: SystemErrorCode;
  timestamp: string;
}

export class ErrorHandlingService {
  /**
   * Format standardized successful backend response payload.
   */
  static successResponse<T>(data: T, message = 'Operation completed successfully.'): StandardizedBackendResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format standardized backend error response payload.
   */
  static errorResponse(
    message: string,
    errorCode: SystemErrorCode = SystemErrorCode.SYSTEM_DATABASE_ERROR,
    data?: any
  ): StandardizedBackendResponse {
    return {
      success: false,
      message,
      errorCode,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
