import { ref } from "vue";
import { getOmiseConfig } from "../api/planApi";

const OMISE_SCRIPT_SRC = "https://cdn.omise.co/omise.js";

/** @type {Promise<typeof window.Omise> | null} */
let loadPromise = null;

/**
 * Omise.js: `Omise.createToken({ card })` returns a one-time token id
 * (often `tokn_test_…` / `tokn_live_…` in newer APIs — send as `omiseToken` to backend).
 * Never send raw card data to your server.
 */

async function resolvePublicKey() {
  const fromEnv = import.meta.env.VITE_OMISE_PUBLIC_KEY;
  if (fromEnv) return String(fromEnv);
  try {
    const cfg = await getOmiseConfig();
    return cfg?.publicKey ? String(cfg.publicKey) : "";
  } catch {
    return "";
  }
}

/**
 * @returns {Promise<typeof window.Omise>}
 */
export async function ensureOmise() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Omise can only run in the browser"));
  }

  if (window.Omise) {
    const key = await resolvePublicKey();
    window.Omise.setPublicKey(key);
    return window.Omise;
  }

  if (loadPromise) {
    const Omise = await loadPromise;
    const key = await resolvePublicKey();
    Omise.setPublicKey(key);
    return Omise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = OMISE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      if (!window.Omise) {
        reject(new Error("Omise failed to load"));
        return;
      }
      resolve(window.Omise);
    };
    script.onerror = () => reject(new Error("Failed to load Omise script"));
    document.body.appendChild(script);
  });

  const Omise = await loadPromise;
  const key = await resolvePublicKey();
  Omise.setPublicKey(key);
  return Omise;
}

/**
 * @param {object} card Fields for Omise token API
 * @param {string} card.name
 * @param {string} card.number digits only
 * @param {number} card.expiration_month 1–12
 * @param {number} card.expiration_year 4 digits (e.g. 2026)
 * @param {string} card.security_code
 * @returns {Promise<{ id: string }>}
 * @see https://www.omise.co/omise-js — createToken("card", tokenParameters, callback)
 */
export async function createOmiseCardToken(card) {
  const Omise = await ensureOmise();
  const tokenParameters = {
    name: card.name,
    number: String(card.number).replace(/\s/g, ""),
    expiration_month: Number(card.expiration_month),
    expiration_year: Number(card.expiration_year),
    security_code: String(card.security_code),
  };

  return new Promise((resolve, reject) => {
    Omise.createToken("card", tokenParameters, (statusCode, response) => {
      if (statusCode === 200 && response?.object === "token" && response.id) {
        resolve({ id: response.id });
      } else {
        const msg =
          response?.message ||
          (typeof response?.code === "string" ? response.code : null) ||
          `Token failed (${statusCode})`;
        reject(new Error(msg));
      }
    });
  });
}

export function useOmise() {
  const ready = ref(false);
  const initError = ref(null);

  async function init() {
    try {
      await ensureOmise();
      ready.value = true;
      initError.value = null;
    } catch (e) {
      initError.value = e instanceof Error ? e.message : "Omise init failed";
      throw e;
    }
  }

  return {
    ready,
    initError,
    ensureOmise,
    createOmiseCardToken,
    init,
  };
}
