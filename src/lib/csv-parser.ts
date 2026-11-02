import Papa from "papaparse";
import type { LeaderboardEntry } from "@/lib/utils";

/**
 * Validates and normalizes web URLs, returning null for non-URLs like "Not applicable" or "-".
 */
export function sanitizeUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Parses CSV text using PapaParse with support for:
 * - Commas in quotes, escaped quotes, multiline cells, CRLF/LF line endings, UTF-8 BOM
 * - Both legacy and 12-column GDGC study jam formats
 * - Strict header and email uniqueness validation
 */
export const parseCSVText = (csvText: string): LeaderboardEntry[] => {
  if (!csvText || typeof csvText !== "string" || !csvText.trim()) {
    throw new Error("CSV file is empty or invalid");
  }

  // Strip UTF-8 Byte Order Mark (BOM) if present
  const sanitizedText = csvText.replace(/^\uFEFF/, "");

  const parsed = Papa.parse<Record<string, string>>(sanitizedText, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors && parsed.errors.length > 0) {
    const fatalError = parsed.errors.find(
      (err) => err.type !== "FieldMismatch" || err.code !== "TooFewFields"
    );
    if (fatalError) {
      throw new Error(`CSV Parsing error: ${fatalError.message} at row ${fatalError.row}`);
    }
  }

  const rows = parsed.data;
  if (!rows || rows.length === 0) {
    throw new Error("CSV file contains no data rows");
  }

  const headers = parsed.meta.fields || [];

  // Identify name column
  const nameHeader = headers.find((h) =>
    ["User Name", "userName", "Name", "Participant Name"].includes(h)
  );

  // Identify email column
  const emailHeader = headers.find((h) =>
    ["User Email", "email", "Email", "Participant Email"].includes(h)
  );

  if (!nameHeader || !emailHeader) {
    const missing: string[] = [];
    if (!nameHeader) missing.push("User Name");
    if (!emailHeader) missing.push("User Email");
    throw new Error(`Missing mandatory header(s): ${missing.join(", ")}`);
  }

  // Identify skill badges column
  const skillBadgesHeader = headers.find((h) =>
    [
      "Skill Badges Completed Count",
      "# of Skill Badges Completed",
      "skillBadgesCompleted",
      "Skill Badges Completed",
    ].includes(h)
  );

  if (!skillBadgesHeader) {
    throw new Error("Missing mandatory column: 'Skill Badges Completed Count' or '# of Skill Badges Completed'");
  }

  // Optional columns (legacy and new format)
  const arcadeGamesHeader = headers.find((h) =>
    [
      "# of Arcade Games Completed",
      "Arcade Games Completed Count",
      "arcadeGamesCompleted",
      "Arcade Games Completed",
    ].includes(h)
  );

  const completionHeader = headers.find((h) =>
    ["All Skill Badges & Games Completed", "allCompleted"].includes(h)
  );

  const skillsUrlHeader = headers.find((h) =>
    [
      "Google Skills Profile URL",
      "Google Cloud Skills Boost Profile URL",
      "skillsProfileUrl",
      "Skills Profile URL",
    ].includes(h)
  );

  const skillsStatusHeader = headers.find((h) =>
    ["Google Skills Profile Status", "skillsProfileStatus"].includes(h)
  );

  const devUrlHeader = headers.find((h) =>
    [
      "Google Developer Profile URL",
      "developerProfileUrl",
      "Developer Profile URL",
    ].includes(h)
  );

  const devStatusHeader = headers.find((h) =>
    ["Google Developer Profile Status", "developerProfileStatus"].includes(h)
  );

  const accessRedemptionHeader = headers.find((h) =>
    ["Access Code Redemption Status", "accessCodeRedemptionStatus"].includes(h)
  );

  const milestoneHeader = headers.find((h) =>
    ["Milestone Completed", "milestoneCompleted"].includes(h)
  );

  const gearBadgesHeader = headers.find((h) =>
    ["GEAR Digital Badges", "gearDigitalBadges"].includes(h)
  );

  const badgeNamesHeader = headers.find((h) =>
    ["Skill Badges Completed Names", "skillBadgesCompletedNames"].includes(h)
  );

  const seenEmails = new Set<string>();
  const duplicates: string[] = [];
  const entries: Omit<LeaderboardEntry, "rank">[] = [];

  rows.forEach((row, index) => {
    const rawEmail = row[emailHeader];
    const rawName = row[nameHeader];

    const email = (rawEmail || "").trim().toLowerCase();
    const userName = (rawName || "").trim();

    // Skip empty lines
    if (!email && !userName) {
      return;
    }

    const rowNumber = index + 2;

    if (!userName) {
      throw new Error(`Import error at row ${rowNumber}: 'User Name' cannot be empty`);
    }

    if (!email) {
      throw new Error(`Import error at row ${rowNumber}: 'User Email' cannot be empty for user '${userName}'`);
    }

    if (!email.includes("@") || !email.includes(".")) {
      throw new Error(`Import error at row ${rowNumber}: Invalid email format '${email}'`);
    }

    if (seenEmails.has(email)) {
      duplicates.push(`'${email}' (row ${rowNumber})`);
    } else {
      seenEmails.add(email);
    }

    // Parse badge count
    const rawBadges = skillBadgesHeader ? (row[skillBadgesHeader] || "").trim() : "0";
    const parsedBadges = parseInt(rawBadges, 10);
    const skillBadgesCompleted = isNaN(parsedBadges) ? 0 : parsedBadges;

    // Parse arcade games (legacy only)
    let arcadeGamesCompleted: number | null = null;
    if (arcadeGamesHeader && row[arcadeGamesHeader] !== undefined && row[arcadeGamesHeader] !== "") {
      const parsedArcade = parseInt(row[arcadeGamesHeader].trim(), 10);
      arcadeGamesCompleted = isNaN(parsedArcade) ? null : parsedArcade;
    }

    // Parse completion status (legacy only)
    let allCompleted: "Yes" | "No" | null = null;
    if (completionHeader && row[completionHeader] !== undefined && row[completionHeader] !== "") {
      const val = row[completionHeader].trim();
      if (val === "Yes" || val === "No") {
        allCompleted = val;
      }
    }

    // Profile URLs
    const skillsProfileUrl = skillsUrlHeader ? sanitizeUrl(row[skillsUrlHeader]) : null;
    const developerProfileUrl = devUrlHeader ? sanitizeUrl(row[devUrlHeader]) : null;

    // Statuses and milestones
    const skillsProfileStatus = skillsStatusHeader ? (row[skillsStatusHeader] || "").trim() || null : null;
    const developerProfileStatus = devStatusHeader ? (row[devStatusHeader] || "").trim() || null : null;
    const accessCodeRedemptionStatus = accessRedemptionHeader ? (row[accessRedemptionHeader] || "").trim() || null : null;
    const milestoneCompleted = milestoneHeader ? (row[milestoneHeader] || "").trim() || null : null;
    const gearDigitalBadges = gearBadgesHeader ? (row[gearBadgesHeader] || "").trim() || null : null;
    const skillBadgesCompletedNames = badgeNamesHeader ? (row[badgeNamesHeader] || "").trim() || null : null;

    // Notice: Access Code is intentionally NOT mapped or stored in public fields!

    entries.push({
      userName,
      email,
      skillsProfileUrl,
      skillsProfileStatus,
      developerProfileUrl,
      developerProfileStatus,
      accessCodeRedemptionStatus,
      milestoneCompleted,
      gearDigitalBadges,
      skillBadgesCompleted,
      skillBadgesCompletedNames,
      arcadeGamesCompleted,
      allCompleted,

      // Legacy UI property aliases
      "User Name": userName,
      "User Email": email,
      "# of Skill Badges Completed": skillBadgesCompleted,
      "# of Arcade Games Completed": arcadeGamesCompleted,
      "All Skill Badges & Games Completed": allCompleted,
      "Google Cloud Skills Boost Profile URL": skillsProfileUrl,
    });
  });

  if (duplicates.length > 0) {
    throw new Error(`Duplicate participant email address(es) detected: ${duplicates.join(", ")}`);
  }

  if (entries.length === 0) {
    throw new Error("No valid participant records found in CSV");
  }

  return sortLeaderboardData(entries);
};

/**
 * Primary ranking: Skill Badges Completed Count (descending)
 * Tie-breaking: Arcade Games Completed Count (descending) if present in older dataset,
 * else stable order.
 */
export const sortLeaderboardData = (
  data: (Omit<LeaderboardEntry, "rank"> | LeaderboardEntry)[]
): LeaderboardEntry[] => {
  return [...data]
    .sort((a, b) => {
      // Primary: skill badges descending
      if (b.skillBadgesCompleted !== a.skillBadgesCompleted) {
        return b.skillBadgesCompleted - a.skillBadgesCompleted;
      }

      // Tie-breaker: Arcade games completed if both have non-null values
      const hasArcadeA = a.arcadeGamesCompleted !== null && a.arcadeGamesCompleted !== undefined;
      const hasArcadeB = b.arcadeGamesCompleted !== null && b.arcadeGamesCompleted !== undefined;

      if (hasArcadeA && hasArcadeB && a.arcadeGamesCompleted !== b.arcadeGamesCompleted) {
        return (b.arcadeGamesCompleted as number) - (a.arcadeGamesCompleted as number);
      }

      // Stable ordering for tied participants
      return 0;
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
};

export const uploadCSV = async (file: File): Promise<LeaderboardEntry[]> => {
  const text = await file.text();
  return parseCSVText(text);
};
