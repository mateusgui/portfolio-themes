import { MailIcon } from 'lucide-react';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

import { useContent } from '../content/index.ts';
import { profile } from '../content/profile.ts';
import { GitHubIcon, LinkedInIcon } from '../layout/BrandIcons.tsx';
import { Section } from './Section.tsx';

interface ContactLink {
  labelKey: 'contact.email' | 'contact.linkedin' | 'contact.github';
  href: string;
  text: string;
  icon: ComponentType<{ className?: string }>;
  external: boolean;
}

/** `https://www.linkedin.com/in/x` → `linkedin.com/in/x`. */
function displayUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, '');
}

// Sem telefone: o contato público é o e-mail.
const LINKS: ContactLink[] = [
  {
    labelKey: 'contact.email',
    href: `mailto:${profile.email}`,
    text: profile.email,
    icon: MailIcon,
    external: false,
  },
  {
    labelKey: 'contact.linkedin',
    href: profile.links.linkedin,
    text: displayUrl(profile.links.linkedin),
    icon: LinkedInIcon,
    external: true,
  },
  {
    labelKey: 'contact.github',
    href: profile.links.github,
    text: displayUrl(profile.links.github),
    icon: GitHubIcon,
    external: true,
  },
];

export function Contact() {
  const { t } = useTranslation();
  const { contact } = useContent();

  return (
    <Section id="contato" title={t('sections.contato')}>
      <p className="max-w-prose text-lg leading-relaxed">{contact.intro}</p>
      <ul className="flex flex-col gap-4">
        {LINKS.map(({ labelKey, href, text, icon: Icon, external }) => (
          <li key={labelKey} className="flex items-center gap-3">
            <Icon aria-hidden="true" className="size-5 shrink-0 text-accent" />
            <span className="sr-only">{t(labelKey)}:</span>
            <a
              href={href}
              {...(external && {
                target: '_blank',
                rel: 'noopener noreferrer',
                'aria-label': `${t(labelKey)}: ${text} ${t('newTab')}`,
              })}
              className="font-medium break-all underline-offset-4 hover:text-accent hover:underline"
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
