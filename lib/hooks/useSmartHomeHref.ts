"use client";

import { useState, useEffect } from "react";
import { getSmartHomeHref } from "@/lib/logo-href";

/**
 * Hook que retorna a rota correta para a logo do DiabetesCare,
 * evitando hydration mismatch entre SSR e client.
 *
 * Durante SSR, retorna "/" (padrão seguro).
 * Após a hidratação, lê o localStorage e retorna a rota adequada.
 */
export function useSmartHomeHref(): string {
  const [href, setHref] = useState("/");

  useEffect(() => {
    setHref(getSmartHomeHref());
  }, []);

  return href;
}
