import { ref } from "vue";

const OMISE_SCRIPT_SRC = "https://cdn.omise.co/omise.js";
const OMISE_PUBLIC_KEY = String(import.meta.env.VITE_OMISE_PUBLIC_KEY || "");

/** @type {Promise<typeof window.Omise> | null} */
let loadPromise = null;

/**
 * Omise.js: `Omise.createToken("card", tokenParameters, cb)` returns a one-time token id
 * (often `tokn_test_…` / `tokn_live_…` — send as `omiseToken` to backend).
 * There is no tokenParameters flag to restrict to Visa/Mastercard; enforce card brand in your form
 * or on the server. Account-level supported brands are in the Omise Dashboard / Capability API;
 * charging an unsupported brand can return e.g. `brand_not_supported`.
 * Never send raw card data to your server.
 */

async function resolvePublicKey() {
  const key = OMISE_PUBLIC_KEY.trim();
  console.info("[omise] key debug", {
    exists: Boolean(key),
    len: key.length,
    key,
  });

  if (!key) {
    throw new Error(
      "Missing VITE_OMISE_PUBLIC_KEY. Set it in your deployment environment and redeploy.",
    );
  }
  if (!key.startsWith("pkey_")) {
    throw new Error(
      "Invalid VITE_OMISE_PUBLIC_KEY. Expected an Omise public key starting with 'pkey_'.",
    );
  }
  return key;
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
 * @see https://www.omise.co/omise-js
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
