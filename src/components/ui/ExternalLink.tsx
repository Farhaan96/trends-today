import Link from 'next/link';
import { ReactNode } from 'react';

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  target?: string;
  forceExternal?: boolean;
  forceSponsored?: boolean;
  forceNofollow?: boolean;
  'aria-label'?: string;
}

/**
 * Smart external link component that automatically detects and handles:
 * - Internal vs external links
 * - Affiliate/sponsored links
 * - Security attributes (noopener, noreferrer)
 * - SEO attributes (nofollow, sponsored)
 */
export default function ExternalLink({
  href,
  children,
  className = '',
  target,
  forceExternal = false,
  forceSponsored = false,
  forceNofollow = false,
  'aria-label': ariaLabel,
  ...props
}: ExternalLinkProps) {
  // Normalize the URL
  const normalizedHref = href.trim();

  // Check if it's an internal link
  const isInternal =
    normalizedHref.startsWith('/') ||
    normalizedHref.startsWith('#') ||
    normalizedHref.startsWith('mailto:') ||
    normalizedHref.startsWith('tel:') ||
    normalizedHref.includes('trendstoday.ca') ||
    normalizedHref.includes('localhost') ||
    normalizedHref.startsWith('javascript:');

  // Check if it's an affiliate/sponsored link
  const isAffiliate =
    forceSponsored ||
    /(?:ref|affid|affiliate|partner|sponsored|utm_source|utm_campaign|tag=|aff_|referral)/i.test(normalizedHref) ||
    /(?:amazon\.com|amzn\.to|bit\.ly|geni\.us|bestbuy\.com|target\.com).*[?&](?:ref|tag|affid)/i.test(normalizedHref);

  // Check if it should be nofollow
  const shouldNofollow =
    forceNofollow ||
    isAffiliate ||
    /(?:bit\.ly|tinyurl\.com|t\.co|short\.link|ow\.ly)/i.test(normalizedHref);

  // If it's internal, use Next.js Link
  if (isInternal && !forceExternal) {
    return (
      <Link
        href={normalizedHref}
        className={className}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </Link>
    );
  }

  // Build rel attribute for external links
  const relParts = ['noopener', 'noreferrer'];

  if (isAffiliate) {
    relParts.push('sponsored');
  }

  if (shouldNofollow) {
    relParts.push('nofollow');
  }

  const rel = relParts.join(' ');

  return (
    <a
      href={normalizedHref}
      target={target || '_blank'}
      rel={rel}
      className={className}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </a>
  );
}

/**
 * Utility function to process links in HTML content
 * This can be used to post-process MDX content or other HTML
 */
export function processLinksInHTML(html: string): string {
  return html.replace(
    /<a\s+([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi,
    (match, beforeHref, href, afterHref) => {
      // Skip if already has rel attribute
      if (/rel=["'][^"']*["']/i.test(beforeHref + afterHref)) {
        return match;
      }

      const normalizedHref = href.trim();

      // Check if internal
      const isInternal =
        normalizedHref.startsWith('/') ||
        normalizedHref.startsWith('#') ||
        normalizedHref.startsWith('mailto:') ||
        normalizedHref.startsWith('tel:') ||
        normalizedHref.includes('trendstoday.ca') ||
        normalizedHref.includes('localhost');

      if (isInternal) {
        return match; // Keep internal links as-is
      }

      // Check if affiliate/sponsored
      const isAffiliate =
        /(?:ref|affid|affiliate|partner|sponsored|utm_source|utm_campaign|tag=|aff_|referral)/i.test(normalizedHref) ||
        /(?:amazon\.com|amzn\.to|bit\.ly|geni\.us|bestbuy\.com|target\.com).*[?&](?:ref|tag|affid)/i.test(normalizedHref);

      // Check if should be nofollow
      const shouldNofollow =
        isAffiliate ||
        /(?:bit\.ly|tinyurl\.com|t\.co|short\.link|ow\.ly)/i.test(normalizedHref);

      // Build rel attribute
      const relParts = ['noopener', 'noreferrer'];

      if (isAffiliate) {
        relParts.push('sponsored');
      }

      if (shouldNofollow) {
        relParts.push('nofollow');
      }

      const rel = relParts.join(' ');

      // Add target="_blank" if not present
      const hasTarget = /target=["'][^"']*["']/i.test(beforeHref + afterHref);
      const targetAttr = hasTarget ? '' : ' target="_blank"';

      return `<a ${beforeHref}href="${href}"${afterHref} rel="${rel}"${targetAttr}>`;
    }
  );
}

/**
 * Component for sponsored/affiliate links with disclosure
 */
interface SponsoredLinkProps extends ExternalLinkProps {
  showDisclosure?: boolean;
  disclosureText?: string;
}

export function SponsoredLink({
  showDisclosure = true,
  disclosureText = "Sponsored",
  children,
  className = '',
  ...props
}: SponsoredLinkProps) {
  return (
    <span className="inline-flex items-center gap-1">
      <ExternalLink
        {...props}
        forceSponsored={true}
        className={`${className} ${showDisclosure ? 'mr-1' : ''}`}
      >
        {children}
      </ExternalLink>
      {showDisclosure && (
        <span className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
          {disclosureText}
        </span>
      )}
    </span>
  );
}

/**
 * Utility to validate and normalize URLs
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();

  // Remove any surrounding whitespace
  if (!trimmed) return '';

  // Ensure protocol for external URLs
  if (trimmed.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}