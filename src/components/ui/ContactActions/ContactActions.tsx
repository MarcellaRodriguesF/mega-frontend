"use client";

import { useState } from "react";
import { WhatsappLogo, Phone, X } from "@phosphor-icons/react";
import styles from "./ContactActions.module.css";

interface ContactActionsProps {
  label: string;
  phone?: string | null;
}

export default function ContactActions({ label, phone }: ContactActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const normalizedPhone = phone?.replace(/\D/g, "");

  const hasPhone = normalizedPhone && normalizedPhone.length > 0;

  return (
    <div className={styles.container}>
      {/* <span className={styles.label}>{label}:</span> */}

      {hasPhone ? (
        <button
          type="button"
          className={styles.phone}
          onClick={() => setIsOpen(true)}
        >
          {phone}
        </button>
      ) : (
        <strong className={styles.phoneValue}>—</strong>
      )}

      {isOpen && hasPhone && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.close}
              onClick={() => setIsOpen(false)}
              aria-label="Fechar"
            >
              <X size={18} />
            </button>

            <h3 id="contact-modal-title">Entrar em contato</h3>
            <p>{phone}</p>

            <div className={styles.actions}>
              <a
                href={`https://wa.me/${normalizedPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.action}
                onClick={() => setIsOpen(false)}
              >
                <WhatsappLogo size={21} />
                WhatsApp
              </a>

              <a
                href={`tel:+${normalizedPhone}`}
                className={styles.action}
                onClick={() => setIsOpen(false)}
              >
                <Phone size={21} />
                Ligar
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
