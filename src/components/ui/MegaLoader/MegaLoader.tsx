"use client";

import styles from "./MegaLoader.module.css";

export default function MegaLoader() {
  return (
    <main
      className={styles.container}
      role="status"
      aria-label="Carregando sessão"
    >
      <svg
        className={styles.logo}
        viewBox="0 0 784 539"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="megaLeft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#075638" />
            <stop offset="100%" stopColor="#087747" />
          </linearGradient>

          <linearGradient id="megaCenter" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#087747" />
            <stop offset="100%" stopColor="#00472E" />
          </linearGradient>

          <linearGradient id="megaRight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#08663E" />
            <stop offset="100%" stopColor="#087747" />
          </linearGradient>
        </defs>

        {/* Perna esquerda */}
        <path
          className={styles.left}
          fill="url(#megaLeft)"
          d="M0 539 L158 85 L238 329 L168 539 Z"
        />

        {/* Parte central do M */}
        <path
          className={styles.center}
          fill="url(#megaCenter)"
          d="M158 85 L322 85 L389 294 L462 85 L545 329 L477 539 L307 539 L238 329 Z"
        />

        {/* Perna direita */}
        <path
          className={styles.right}
          fill="url(#megaRight)"
          d="M462 85 L628 85 L783 539 L615 539 L545 329 Z"
        />
      </svg>
    </main>
  );
}
