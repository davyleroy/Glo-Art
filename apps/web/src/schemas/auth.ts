import { z } from 'zod';

// Message strings are i18n sub-keys *under* the `errors` namespace. Forms use
// `useTranslations('errors')` so they resolve to e.g. errors.username.invalidChars.
export const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: 'email.invalid' })
  .max(254);

export const PasswordSchema = z
  .string()
  .min(12, { message: 'password.tooShort' })
  .max(128, { message: 'password.tooLong' })
  // At least one letter and one number; punctuation allowed.
  .refine((v) => /[a-zA-Z]/.test(v) && /\d/.test(v), {
    message: 'password.weak',
  });

export const UsernameSchema = z
  .string()
  .trim()
  .min(3, { message: 'username.tooShort' })
  .max(32, { message: 'username.tooLong' })
  .regex(/^[a-z0-9_]+$/i, { message: 'username.invalidChars' });

export const RegisterSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  displayName: z.string().trim().min(1, { message: 'displayName.required' }).max(80),
  username: UsernameSchema,
  locale: z.enum(['en', 'fr', 'rw']).default('en'),
  acceptTerms: z
    .union([z.literal('on'), z.literal('true'), z.boolean()])
    .refine((v) => v === true || v === 'on' || v === 'true', {
      message: 'terms.required',
    }),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, { message: 'password.required' }),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const VerifyEmailSchema = z.object({
  token: z.string().min(16),
});
