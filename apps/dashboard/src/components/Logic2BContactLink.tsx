import { logic2bContact } from '@logic-camp/config/contact';
import { cn } from '@logic-camp/ui';
import { MessageCircle } from 'lucide-react';

const contact = logic2bContact('es', 'dashboard');

export default function Logic2BContactLink({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <a
      href={contact.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={contact.ariaLabel}
      title={`${contact.ariaLabel} · ${contact.phone}`}
      data-logic2b-contact
      data-contact-context="dashboard"
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        compact && 'size-11 justify-center px-0',
        className,
      )}
    >
      <MessageCircle className="size-4 shrink-0 text-primary" aria-hidden />
      {!compact && <span>{contact.label}</span>}
    </a>
  );
}
