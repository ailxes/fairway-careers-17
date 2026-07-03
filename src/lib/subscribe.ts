import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

/**
 * Single write-path for the email list. The list is the business's most
 * durable asset, so every signup goes through here: emails are normalized,
 * duplicates are treated as success (returning subscriber ≠ error), and
 * source_page is recorded so we learn which placements actually convert.
 */
export async function subscribe(
  email: string,
  sourcePage: string,
  savedSearch?: Record<string, unknown>,
): Promise<{ ok: boolean; already: boolean }> {
  const normalized = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) return { ok: false, already: false };

  const { data, error } = await supabase
    .from("subscribers")
    .upsert(
      {
        email: normalized,
        source_page: sourcePage,
        saved_search: (savedSearch ?? null) as Json,
      },
      { onConflict: "email", ignoreDuplicates: true },
    )
    .select("id");

  if (error) {
    // Pre-migration DBs have no unique constraint/source_page column yet —
    // fall back to the legacy insert so signups are never dropped.
    const legacy = await supabase
      .from("subscribers")
      .insert({ email: normalized, saved_search: (savedSearch ?? null) as Json });
    return { ok: !legacy.error, already: false };
  }
  return { ok: true, already: (data ?? []).length === 0 };
}
