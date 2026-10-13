"use client";

import { useEffect, useRef, useState } from "react";

import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import Field, { inputClass } from "@/components/Field";
import FormError from "@/components/FormError";
import { useCreateLead } from "@/hooks/useLeads";
import { toFormErrors } from "@/lib/api";

interface AddLeadDialogProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function AddLeadDialog({ onClose, onCreated }: AddLeadDialogProps) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  const nameInput = useRef<HTMLInputElement>(null);

  // The native dialog focuses its first control (the close button) when it opens;
  // this runs after that and moves focus to where typing should start.
  useEffect(() => nameInput.current?.focus(), []);

  const createLead = useCreateLead();
  const serverErrors = createLead.error ? toFormErrors(createLead.error) : null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }
    setNameError(null);
    // Status is left out on purpose: the API starts every lead as "New".
    createLead.mutate({ name, company, phone }, { onSuccess: onCreated });
  }

  return (
    <Dialog eyebrow="New lead" title="Add a lead" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 px-6 py-6">
        <FormError message={serverErrors?.general ?? null} />

        <Field label="Name" error={nameError ?? serverErrors?.fields.name}>
          {(control) => (
            <input
              {...control}
              ref={nameInput}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
              autoComplete="off"
              placeholder="e.g. Priya Sharma"
              className={inputClass}
            />
          )}
        </Field>

        <Field label="Company" optional error={serverErrors?.fields.company}>
          {(control) => (
            <input
              {...control}
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              maxLength={120}
              autoComplete="off"
              className={inputClass}
            />
          )}
        </Field>

        <Field label="Phone" optional error={serverErrors?.fields.phone}>
          {(control) => (
            <input
              {...control}
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              maxLength={30}
              autoComplete="off"
              className={inputClass}
            />
          )}
        </Field>

        <p className="text-sm text-muted">New leads start with the status New. You can change it from the lead&apos;s timeline.</p>

        <div className="flex justify-end gap-3 border-t border-line pt-5">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createLead.isPending}>
            {createLead.isPending ? "Adding…" : "Add lead"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
