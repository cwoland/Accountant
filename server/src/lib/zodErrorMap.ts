import { z } from 'zod';

export const codeErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case z.ZodIssueCode.too_small:
      return { message: issue.type === 'string'
        ? `validation.tooShort|min=${issue.minimum}`
        : `validation.tooSmall|min=${issue.minimum}` };
    case z.ZodIssueCode.invalid_string:
      return { message: issue.validation === 'email' ? 'validation.emailInvalid' : 'validation.invalid' };
    default:
      return { message: ctx.defaultError };
  }
};
z.setErrorMap(codeErrorMap);