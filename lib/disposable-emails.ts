/**
 * Disposable email domain blocklist.
 * Blocks bot/spam account creation using throwaway email services.
 * This is a curated list of the most common disposable providers.
 * Add more as needed.
 */
const DISPOSABLE_DOMAINS = new Set([
  // Major disposable email providers
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.de",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "throwaway.email",
  "throwaway.email",
  "yopmail.com",
  "yopmail.fr",
  "10minutemail.com",
  "10minutemail.net",
  "minutemail.com",
  "trashmail.com",
  "trashmail.me",
  "trashmail.net",
  "dispostable.com",
  "maildrop.cc",
  "mailnesia.com",
  "fakeinbox.com",
  "sharklasers.com",
  "grr.la",
  "guerrillamail.biz",
  "getnada.com",
  "tempail.com",
  "mohmal.com",
  "burner.kiwi",
  "discard.email",
  "discardmail.com",
  "discardmail.de",
  "emailondeck.com",
  "harakirimail.com",
  "mailcatch.com",
  "mailexpire.com",
  "mailhazard.com",
  "mailhazard.us",
  "mailmoat.com",
  "mailnull.com",
  "mailscrap.com",
  "mailshell.com",
  "mailsiphon.com",
  "mailtemp.info",
  "mailzilla.com",
  "nomail.xl.cx",
  "nowmymail.com",
  "pookmail.com",
  "spambox.us",
  "spamfree24.org",
  "spamgourmet.com",
  "spamhole.com",
  "spamspot.com",
  "tempinbox.com",
  "tempr.email",
  "wegwerfmail.de",
  "wegwerfmail.net",
  "wh4f.org",
  "jetable.org",
  "emailna.co",
  "emailo.pro",
  "crazymailing.com",
  "mytemp.email",
  "tempmailo.com",
  "tmpmail.net",
  "tmpmail.org",
  "binkmail.com",
  "bobmail.info",
  "chammy.info",
  "devnullmail.com",
  "dumpmail.de",
  "example.com",
  "fasttail.com",
  "filzmail.com",
  "fixmail.tk",
  "flurred.com",
  "gishpuppy.com",
  "imstations.com",
  "inboxalias.com",
  "koszmail.pl",
  "kurzepost.de",
  "letthemeatspam.com",
  "lol.ovpn.to",
  "mailblocks.com",
  "mailquack.com",
  "mintemail.com",
  "nomail.pw",
  "objectmail.com",
  "proxymail.eu",
  "rcpt.at",
  "reallymymail.com",
  "recode.me",
  "spamavert.com",
  "spamcero.com",
  "uggsrock.com",
  "upliftnow.com",
  "venompen.com",
  "veryrealemail.com",
  "viditag.com",
  "whyspam.me",
  "wuzup.net",
  "xagloo.com",
  "zetmail.com",
]);

/**
 * Check if an email address uses a disposable/temporary domain.
 * @returns true if the email is disposable (should be blocked)
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;

  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;

  return DISPOSABLE_DOMAINS.has(domain);
}

/**
 * Validate an email address for registration.
 * Returns null if valid, or an error message string if invalid.
 */
export function validateRegistrationEmail(email: string): string | null {
  if (!email || typeof email !== "string") {
    return "Please enter a valid email address.";
  }

  const trimmed = email.trim().toLowerCase();

  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return "Please enter a valid email address.";
  }

  // Disposable email check
  if (isDisposableEmail(trimmed)) {
    return "Please use a permanent email address. Temporary/disposable emails are not allowed.";
  }

  return null; // Valid
}
