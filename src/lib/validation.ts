import { z } from 'zod';
export const memberSchema = z.object({
  name: z.string().trim().min(2, 'Enter a full name.').max(120),
  email: z.string().trim().email('Enter a valid email.').transform(value => value.toLowerCase()),
  mobile: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/, 'Use 8–15 digits, with an optional country-code +.').transform(value => value.replace(/^\+/, '')),
  institution: z.string().trim().min(2).max(200),
  role: z.enum(['leader', 'member']),
});
export const registrationSchema = z.object({
  teamName: z.string().trim().min(2).max(100), institution: z.string().trim().min(2).max(200),
  problemStatement: z.string().trim().min(3).max(240),
  category: z.enum(['school', 'college']), mentor: z.string().trim().max(120).optional(),
  consent: z.literal(true, { error: 'Consent is required.' }), members: z.array(memberSchema).min(1).max(20),
}).superRefine((value, context) => {
  if (value.members.filter(member => member.role === 'leader').length !== 1) context.addIssue({ code: 'custom', message: 'Exactly one team leader is required.' });
  if (new Set(value.members.map(member => member.email)).size !== value.members.length) context.addIssue({ code: 'custom', message: 'Every member needs a distinct email.' });
  if (new Set(value.members.map(member => member.mobile)).size !== value.members.length) context.addIssue({ code: 'custom', message: 'Every member needs a distinct mobile number.' });
});
export type Member = z.infer<typeof memberSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
