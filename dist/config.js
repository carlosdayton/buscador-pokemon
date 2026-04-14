// URL base do BFF. Em produção, aponte para a URL do Railway.
// Em desenvolvimento local, use http://localhost:8000
export const BFF_BASE_URL = window.__BFF_BASE_URL__ ??
    'https://buscador-pokemon-production.up.railway.app';
