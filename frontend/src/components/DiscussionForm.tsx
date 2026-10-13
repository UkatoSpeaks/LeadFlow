"use client";

import { useState } from "react";

import Button from "@/components/Button";
import Field, { inputClass } from "@/components/Field";
import FormError from "@/components/FormError";
import { useCreateDiscussion } from "@/hooks/useDiscussions";
import { toFormErrors } from "@/lib/api";
import { localInputToIso } from "@/lib/dates";

interface DiscussionFormProps {
  leadId: number;
  onSaved: () => void;
}

export default function DiscussionForm({ leadId, onSaved }: DiscussionFormProps) {
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [errors, setErrors] = useState<{ note?: string; follow_up_at?: string }>({});

  const createDiscussion = useCreateDiscussion(leadId);
  const serverErrors = createDiscussion.error ? toFormErrors(createDiscussion.error) : null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const followUpAt = localInputToIso(followUp);
    const nextErrors: typeof errors = {};
    if (!note.trim()) nextErrors.note = "Write a note about the discussion";
    if (followUp && !followUpAt) nextErrors.follow_up_at = "Enter a valid date and time";
    else if (followUpAt && Date.parse(followUpAt) <= Date.now()) nextErrors.follow_up_at = "Pick a time in the future";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    createDiscussion.mutate(
      { note, follow_up_at: followUpAt },
      {
        onSuccess: () => {
          setNote("");
          setFollowUp("");
          onSaved();
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormError message={serverErrors?.general ?? null} />

      <Field label="New discussion" error={errors.note ?? serverErrors?.fields.note}>
        {(control) => (
          <textarea
            {...control}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            maxLength={5000}
            placeholder="What was discussed?"
            className={`${inputClass} resize-y`}
          />
        )}
      </Field>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="sm:w-64">
          <Field label="Follow-up" optional error={errors.follow_up_at ?? serverErrors?.fields.follow_up_at}>
            {(control) => (
              <input
                {...control}
                type="datetime-local"
                value={followUp}
                onChange={(event) => setFollowUp(event.target.value)}
                className={inputClass}
              />
            )}
          </Field>
        </div>
        <Button type="submit" disabled={createDiscussion.isPending} className="sm:mb-px">
          {createDiscussion.isPending ? "Saving…" : "Save discussion"}
        </Button>
      </div>

      <p className="text-xs text-muted">
        Saving without a follow-up date clears the lead&apos;s current follow-up.
      </p>
    </form>
  );
}
