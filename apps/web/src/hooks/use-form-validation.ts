import { createSignal } from "solid-js";

// 定义错误类型
interface FormErrors {
  [key: string]: string | undefined;
}

export interface UseFormValidationReturn {
  errors: () => FormErrors;
  validate: (formData: any) => FormErrors;
  clearErrors: () => void;
  hasErrors: () => boolean;
  setFieldError: (field: string, error: string | undefined) => void;
}

export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  message?: string;
  validator?: (value: any) => string | undefined;
}

export interface ValidationSchema {
  [field: string]: ValidationRule | ValidationRule[];
}

export const useFormValidation = (
  schema?: ValidationSchema,
): UseFormValidationReturn => {
  const [errors, setErrors] = createSignal<FormErrors>({});

  const validateField = (
    field: string,
    value: any,
    rules: ValidationRule | ValidationRule[],
  ): string | undefined => {
    const ruleArray = Array.isArray(rules) ? rules : [rules];

    for (const rule of ruleArray) {
      if (
        rule.required &&
        (!value || (typeof value === "string" && !value.trim()))
      ) {
        return rule.message || `${field} is required`;
      }

      if (rule.pattern && value && !rule.pattern.test(value)) {
        return rule.message || `Invalid ${field} format`;
      }

      if (rule.validator) {
        const error = rule.validator(value);
        if (error) return error;
      }
    }

    return undefined;
  };

  const validate = (formData: any) => {
    const newErrors: FormErrors = {};

    if (schema) {
      Object.keys(schema).forEach((field) => {
        const rules = schema[field];
        const error = validateField(field, formData[field], rules);
        if (error) {
          newErrors[field] = error;
        }
      });
    }

    setErrors(newErrors);
    return newErrors;
  };

  const clearErrors = () => {
    setErrors({});
  };

  const hasErrors = () => {
    return Object.keys(errors()).length > 0;
  };

  const setFieldError = (field: string, error: string | undefined) => {
    const currentErrors = errors();
    if (error) {
      setErrors({ ...currentErrors, [field]: error });
    } else {
      const newErrors = { ...currentErrors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return {
    errors,
    validate,
    clearErrors,
    hasErrors,
    setFieldError,
  };
};
