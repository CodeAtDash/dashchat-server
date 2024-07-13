import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(
    message: string,
    name: string = 'InternalServerError',
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    cause: unknown = new Error(),
  ) {
    super(
      {
        message,
        name,
        statusCode: status,
      },
      status,
      { cause },
    );
  }
}

export class Unauthorized extends CustomException {
  constructor() {
    super('Unauthorized', 'Unauthorized', HttpStatus.UNAUTHORIZED);
  }
}

export class InvalidArguments extends CustomException {
  constructor() {
    super('Invalid arguments', 'InvalidArguments', HttpStatus.NOT_ACCEPTABLE);
  }
}

export class InvalidUser extends CustomException {
  constructor() {
    super('User does not exist', 'InvalidUser', HttpStatus.NOT_FOUND);
  }
}

export class SomethingWentWrong extends CustomException {
  constructor() {
    super(
      'Something Went Wrong',
      'SomethingWentWrong',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class EmailEnteredNotExist extends CustomException {
  constructor() {
    super(
      'Email Entered Not Exist',
      'EmailEnteredNotExist',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class DuplicateEmail extends CustomException {
  constructor() {
    super(
      'Email already belongs to someone else',
      'DuplicateEmail',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
}

export class EmailBelongsToSomeoneElse extends CustomException {
  constructor() {
    super(
      'This email belongs to someone else',
      'EmailBelongsToSomeoneElse',
      HttpStatus.CONFLICT,
    );
  }
}

export class PleaseEnterDifferentPassword extends CustomException {
  constructor() {
    super(
      'Please Enter Different Password',
      'PleaseEnterADifferentPassword',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class WrongPassword extends CustomException {
  constructor() {
    super('Password is incorrect', 'WrongPassword', HttpStatus.UNAUTHORIZED);
  }
}

export class EmailAlreadyVerified extends CustomException {
  constructor() {
    super(
      'This email is already verified',
      'EmailAlreadyVerified',
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidOtp extends CustomException {
  constructor() {
    super('Invalid OTP', 'InvalidOtp', HttpStatus.NOT_ACCEPTABLE);
  }
}
