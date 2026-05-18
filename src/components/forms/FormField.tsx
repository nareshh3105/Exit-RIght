import { ER } from '@/lib/tokens';
import { Icon } from '@/components/ui/Icon';
import { InputHTMLAttributes, forwardRef } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  iconName?: string;
  trailingIcon?: string;
  hint?: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, iconName, trailingIcon, hint, error, ...props }, ref) => {
    return (
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: ER.mute,
            letterSpacing: 0.3,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          {label}
        </div>
        <div
          style={{
            height: 52,
            borderRadius: 14,
            background: '#fff',
            border: `1px solid ${error ? ER.red : ER.line}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 14px',
            gap: 10,
          }}
        >
          {iconName && (
            <Icon name={iconName as any} size={18} color={ER.mute} />
          )}
          <input
            ref={ref}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 15,
              fontFamily: 'inherit',
              color: ER.ink,
              background: 'transparent',
            }}
            {...props}
          />
          {trailingIcon && (
            <Icon name={trailingIcon as any} size={18} color={ER.mute} />
          )}
        </div>
        {hint && !error && (
          <p style={{ fontSize: 11.5, color: ER.mute, marginTop: 5 }}>{hint}</p>
        )}
        {error && (
          <p style={{ fontSize: 11.5, color: ER.red, marginTop: 5 }}>{error}</p>
        )}
      </div>
    );
  }
);
FormField.displayName = 'FormField';
