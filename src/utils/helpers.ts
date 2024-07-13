import { Logger } from '@nestjs/common';
import {
  isEmpty,
  isNil,
  isNull,
  isNaN,
  get,
  omitBy,
  isUndefined,
} from 'lodash';
import { AxiosError } from 'axios';
import { CustomError, PaginationFilters } from './types';

export const isNilOrEmpty = (value: any) =>
  isNil(value) ||
  isEmpty(value) ||
  isNull(value) ||
  isNaN(value) ||
  isUndefined(value);

export const isPresent = (value: any) => !isNilOrEmpty(value);

export const removeEmptyKeys = (data: any) => omitBy(data || {}, isEmpty);
export const removeUndefinedKeys = (data: any) =>
  omitBy(data || {}, isUndefined);

export const getPaginationFilters = (filters?: PaginationFilters) => ({
  offset: filters?.offset || 0,
  limit: filters?.limit || 10,
  createdAtOrder: filters?.createdAtOrder || 'DESC',
});

export const getEncodedUrl = (url?: string) => {
  return url ? encodeURIComponent(url) : null;
};

export const getHostnameUrl = (input: string) => {
  if (input.includes('www.')) {
    input = input.replace('www.', '');
  }

  if (input.startsWith('http://')) {
    input = input.replace('http://', 'https://');
  }

  if (!input.startsWith('https://')) {
    input = 'https://' + input;
  }

  return new URL(input).hostname;
};

export const getSanitizedUrl = (url: string) => {
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }

  if (!url.startsWith('https://')) {
    url = 'https://' + url;
  }

  return url;
};

export const getUrlFromData = ({
  url,
  base,
  params,
}: {
  url: string | URL;
  base?: string | URL;
  params?: {
    [key: string]: string | number | boolean;
  };
}) => {
  const nonEmptyParams = omitBy(params || {}, isEmpty) as
    | string
    | string[][]
    | Record<string, string>
    | URLSearchParams
    | undefined;

  const searchParams = new URLSearchParams(nonEmptyParams);

  const finalUrl = new URL(url, base);

  for (const [key, value] of searchParams) {
    finalUrl.searchParams.append(key, value);
  }

  return finalUrl.toString();
};

export const getErrorCodeAndMessage = (
  error: unknown,
  { log }: { log: boolean } = { log: true },
): { code: string; message: string } => {
  if (log) {
    Logger.error(error);
  }

  return {
    code: get(error, 'code', get(error, 'response.code', 'SYSTEM_ERROR')),
    message: get(
      error,
      'message',
      get(error, 'response.message', 'Internal Server Error'),
    ),
  };
};

export const handleAxiosError = (error: AxiosError) => {
  const errorObject = get(error, ['response', 'data'], {});

  let code: string = get(errorObject, ['code']);
  let message: string | null = null;
  const errorMessage: string = get(errorObject, ['error']);

  const errorKeysToCheck = ['error_description', 'errorMessage'];
  errorKeysToCheck.map((errMsg) => {
    if (!message) {
      message = get(errorObject, [errMsg]);
    }
  });

  if (!message) {
    message = get(error, ['response', 'errors', 0, 'message']);
  }

  if (!message) {
    message = get(error, ['message'], 'Internal Server Error');
  }
  if (!code) {
    code = get(error, ['response', 'statusText'], 'Internal Server Error');
  }

  throw new CustomError(message, code, errorMessage);
};
