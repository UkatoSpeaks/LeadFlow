/** A failure that does not belong to one field, e.g. the server could not be reached. */
export default function FormError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <p role="alert" className="border border-danger/30 bg-danger-tint px-3 py-2.5 text-sm text-danger">
      {message}
    </p>
  );
}
