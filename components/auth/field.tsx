import { Input } from "@/components/ui/input";

type FieldProps = Omit<React.ComponentProps<typeof Input>, "id"> & {
  name: string;
  label: string;
  errors?: string[];
};

export function Field({ name, label, errors, ...props }: FieldProps) {
  const errorId = `${name}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={name}
        name={name}
        aria-invalid={errors ? true : undefined}
        aria-describedby={errors ? errorId : undefined}
        {...props}
      />
      {errors && (
        <p id={errorId} className="text-xs text-destructive">
          {errors.join(" ")}
        </p>
      )}
    </div>
  );
}
