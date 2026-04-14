// URL base do BFF. Em produção, aponte para a URL do Railway.
// Em desenvolvimento local, use http://localhost:8000
export const BFF_BASE_URL =
    (window as unknown as Record<string, string>).__BFF_BASE_URL__ ??
    'http://localhost:8000';
