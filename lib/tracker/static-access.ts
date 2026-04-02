"use client";

import {
  trackerCooAccessStorageKey,
  trackerCooPasswordHash,
} from "@/lib/site-config";

type AccessGrant = {
  grantedAt: string;
};

function readAccessGrant() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(trackerCooAccessStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as AccessGrant;
    return parsed?.grantedAt ? parsed : null;
  } catch {
    return null;
  }
}

export function hasGrantedCooAccess() {
  return Boolean(readAccessGrant());
}

export function grantCooAccess() {
  if (typeof window === "undefined") {
    return null;
  }

  const grant = {
    grantedAt: new Date().toISOString(),
  };

  window.sessionStorage.setItem(trackerCooAccessStorageKey, JSON.stringify(grant));

  return grant;
}

export function clearGrantedCooAccess() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(trackerCooAccessStorageKey);
}

export async function validateCooPassword(value: string) {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    return false;
  }

  const normalized = value.trim();

  if (!normalized) {
    return false;
  }

  const encoded = new TextEncoder().encode(normalized);
  const digest = await window.crypto.subtle.digest("SHA-256", encoded);
  const hashed = Array.from(new Uint8Array(digest))
    .map((chunk) => chunk.toString(16).padStart(2, "0"))
    .join("");

  return hashed === trackerCooPasswordHash;
}
