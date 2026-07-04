"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FamilyContacts } from "@/components/FamilyContacts";
import { useLocation } from "@/hooks/useLocation";
import { formatCoordinates } from "@/lib/emergencyNumbers";
import type { FamilyContact } from "@/types/emergency";

/**
 * Local-storage-backed family contacts. The PRD §6 shows `family_contacts` as a
 * Supabase table; we keep the table schema in `supabase/schema.sql` and fall
 * back to localStorage so the demo works without any backend provisioned.
 */
const STORAGE_KEY = "erl.family_contacts";

const SEED: FamilyContact[] = [
  { id: "1", name: "Mom", relation: "Mother", phone: "+919876543210" },
  { id: "2", name: "Dad", relation: "Father", phone: "+919876543211" },
  { id: "3", name: "Brother", relation: "Sibling", phone: "+919876543212" },
];

function loadContacts(): FamilyContact[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as FamilyContact[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED;
  } catch {
    return SEED;
  }
}

function saveContacts(contacts: FamilyContact[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch {
    /* ignore quota errors */
  }
}

export default function FamilyScreen() {
  const { coordinates, displayName } = useLocation({
    autoStart: true,
    realtime: true,
  });
  const [contacts, setContacts] = useState<FamilyContact[]>(SEED);
  const [draft, setDraft] = useState({ name: "", relation: "", phone: "" });

  useEffect(() => {
    setContacts(loadContacts());
  }, []);

  const addContact = () => {
    if (!draft.name.trim() || !draft.phone.trim()) return;
    const next: FamilyContact = {
      id: crypto.randomUUID(),
      name: draft.name.trim(),
      relation: draft.relation.trim() || "Contact",
      phone: draft.phone.trim(),
    };
    const updated = [next, ...contacts];
    setContacts(updated);
    saveContacts(updated);
    setDraft({ name: "", relation: "", phone: "" });
  };

  const removeContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    saveContacts(updated);
  };

  const locationLabel = displayName
    ? `${displayName} (${formatCoordinates(coordinates)})`
    : formatCoordinates(coordinates);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="font-display text-2xl font-bold text-foreground">Family &amp; Contacts</h1>
        <p className="text-sm text-muted">Notify or call in one tap. Location link auto-attached.</p>
      </header>

      <Card className="p-4">
        <h2 className="mb-3 font-display text-base font-semibold text-foreground">Add a contact</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Name (e.g., Mom)"
            aria-label="Contact name"
            className="h-11 rounded-pill border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          />
          <input
            value={draft.relation}
            onChange={(e) => setDraft({ ...draft, relation: e.target.value })}
            placeholder="Relation (e.g., Mother)"
            aria-label="Contact relation"
            className="h-11 rounded-pill border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
          />
          <input
            value={draft.phone}
            onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
            placeholder="+91 98765 43210"
            aria-label="Contact phone"
            className="h-11 rounded-pill border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground sm:col-span-2"
          />
        </div>
        <button
          type="button"
          onClick={addContact}
          className="mt-3 inline-flex h-11 items-center justify-center rounded-pill bg-green px-5 text-sm font-semibold text-background transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green"
        >
          Add contact
        </button>
      </Card>

      <FamilyContacts contacts={contacts} locationLabel={locationLabel} />

      {contacts.length > 0 && (
        <Card className="p-4">
          <h2 className="mb-2 font-display text-base font-semibold text-foreground">Manage</h2>
          <ul className="grid gap-2 text-sm">
            {contacts.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2">
                <span className="truncate text-foreground">
                  {c.name} <span className="text-muted">· {c.relation}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeContact(c.id)}
                  className="rounded-pill border border-border px-3 py-1 text-xs text-emergency hover:bg-emergency/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emergency"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
