import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from './constants';

export function IsUsername(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUsername',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          // Regex pattern to match usernames containing only lowercase alphabets and numbers
          const regex = /^[a-z0-9_-]+$/;

          if (
            typeof value !== 'string' ||
            value.length < USERNAME_MIN_LENGTH ||
            value.length > USERNAME_MAX_LENGTH ||
            !regex.test(value)
          ) {
            return false;
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters long and contain only lowercase alphabets, numbers, '_', and '-'`;
        },
      },
    });
  };
}
