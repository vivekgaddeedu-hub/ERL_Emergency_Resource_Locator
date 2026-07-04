"use client";

import { Phone, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FamilyContact } from "@/types/emergency";
import { notifyLink, telLink } from "@/utils/calculateETA";

type FamilyContactsProps = {
  contacts: FamilyContact[];
  locationLabel: string;
};

export function FamilyContacts({ contacts, locationLabel }: FamilyContactsProps) {
  if (contacts.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted">
        No emergency contacts yet. Add Mom, Dad, or close family to get started.
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {contacts.map((contact) => (
        <Card key={contact.id} className="flex items-center gap-4 p-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-navy font-display text-lg font-bold text-foreground"
            aria-hidden
          >
            {contact.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-display text-base font-semibold text-foreground">
                {contact.name}
              </h3>
              <Badge variant="default">{contact.relation}</Badge>
            </div>
            <p className="truncate text-xs text-muted">{contact.phone}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <a
              href={telLink(contact.phone)}
              aria-label={`Call ${contact.name}`}
              className="inline-flex h-12 w-12 items-center justify-center rounded-pill bg-emergency text-white transition-colors hover:bg-emergency-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emergency"
            >
              <Phone className="h-5 w-5" aria-hidden />
            </a>
            <a
              href={notifyLink(contact, locationLabel)}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Notify ${contact.name}`}
              className="inline-flex h-12 w-12 items-center justify-center rounded-pill bg-green text-background transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
            >
              <MapPin className="h-5 w-5" aria-hidden />
            </a>
          </div>
        </Card>
      ))}
    </div>
  );
}

// keep unused-import style consistent
export { Button };
