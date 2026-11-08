export interface Contact {
  id: string;
  companyId: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactRequest {
  name: string;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  isPrimary?: boolean;
}

export interface UpdateContactRequest {
  name?: string;
  role?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  isPrimary?: boolean;
}

export interface ContactResponse {
  status: string;
  message: string;
  data: Contact;
}

export interface ContactsResponse {
  status: string;
  message: string;
  data: Contact[];
}
