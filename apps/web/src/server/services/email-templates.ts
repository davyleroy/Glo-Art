import 'server-only';
import { env } from '@/lib/env';

export interface EmailVerificationTemplateInput {
  displayName: string;
  verificationUrl: string;
  locale: 'en' | 'fr' | 'rw';
}

const SUBJECT: Record<'en' | 'fr' | 'rw', string> = {
  en: `Verify your ${env.BRAND_NAME} email`,
  fr: `Vérifiez votre adresse e-mail ${env.BRAND_NAME}`,
  rw: `Emeza imeyili yawe kuri ${env.BRAND_NAME}`,
};

const BODY: Record<'en' | 'fr' | 'rw', (i: EmailVerificationTemplateInput) => string> = {
  en: (i) => `Hi ${i.displayName},

Welcome to ${env.BRAND_NAME}. Confirm your email to finish creating your account:

${i.verificationUrl}

This link expires in 30 minutes. If you didn't sign up, you can ignore this message.

— ${env.BRAND_NAME}`,
  fr: (i) => `Bonjour ${i.displayName},

Bienvenue sur ${env.BRAND_NAME}. Confirmez votre e-mail pour finaliser la création de votre compte :

${i.verificationUrl}

Ce lien expire dans 30 minutes. Si vous n'avez pas créé de compte, ignorez ce message.

— ${env.BRAND_NAME}`,
  rw: (i) => `Muraho ${i.displayName},

Murakaza neza kuri ${env.BRAND_NAME}. Emeza imeyili yawe kugira ngo urangize gufungura konti :

${i.verificationUrl}

Iri huzane rizarangira mu minota 30. Niba utariwe wafunguye konti, ushobora kutita kuri iyi butumwa.

— ${env.BRAND_NAME}`,
};

export function renderEmailVerification(input: EmailVerificationTemplateInput): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = SUBJECT[input.locale];
  const text = BODY[input.locale](input);
  const html = `<!doctype html><html><body style="font-family: Georgia, serif; background: #fdf7ee; color: #2b2a26; padding: 32px;">
    <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px;">
      <h1 style="font-size: 22px; margin: 0 0 16px;">${subject}</h1>
      <p style="line-height: 1.6;">Hi ${escapeHtml(input.displayName)},</p>
      <p style="line-height: 1.6;">Welcome to <strong>${escapeHtml(env.BRAND_NAME)}</strong>. Confirm your email to finish creating your account.</p>
      <p style="margin: 24px 0;"><a href="${input.verificationUrl}" style="background: #b94a3a; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-family: ui-sans-serif, system-ui, sans-serif;">Verify my email</a></p>
      <p style="color: #6b6a64; font-size: 13px;">Or paste this link into your browser:<br><a href="${input.verificationUrl}">${input.verificationUrl}</a></p>
      <p style="color: #6b6a64; font-size: 13px;">This link expires in 30 minutes.</p>
    </div>
  </body></html>`;
  return { subject, text, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
