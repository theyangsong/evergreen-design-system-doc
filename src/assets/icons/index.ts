import edsAtoms from './eds-atoms.svg?raw';
import edsBizMod from './eds-biz-mod.svg?raw';
import edsBook from './eds-book.svg?raw';
import edsDesktop from './eds-desktop.svg?raw';
import edsLogo from './eds-logo.svg';
import edsMobile from './eds-mibile.svg?raw';
import edsMolecules from './eds-molecules.svg?raw';
import edsMotion from './eds-motion.svg?raw';
import edsOpenBook from './eds-open-book.svg?raw';
import edsOrganisms from './eds-organisme.svg?raw';
import edsSignHashtag from './eds-sign-hashtag.svg?raw';
import edsStarFill from './eds-star-fill.svg?raw';
import edsTemplates from './eds-templates.svg?raw';
import edsThematic from './eds-thematic.svg?raw';
import edsTree from './eds-tree.svg?raw';
import edsWebsite from './eds-website.svg?raw';

export type EdsIconVariant = 'stroke' | 'fill' | 'mixed';

export const edsIcons = {
  'open-book': { content: edsOpenBook, variant: 'stroke' as const },
  tree: { content: edsTree, variant: 'stroke' as const },
  motion: { content: edsMotion, variant: 'stroke' as const },
  atoms: { content: edsAtoms, variant: 'stroke' as const },
  molecules: { content: edsMolecules, variant: 'stroke' as const },
  organisms: { content: edsOrganisms, variant: 'stroke' as const },
  templates: { content: edsTemplates, variant: 'stroke' as const },
  scenes: { content: edsBizMod, variant: 'stroke' as const },
  thematic: { content: edsThematic, variant: 'fill' as const },
  'star-fill': { content: edsStarFill, variant: 'fill' as const },
  'sign-hashtag': { content: edsSignHashtag, variant: 'stroke' as const },
  book: { content: edsBook, variant: 'stroke' as const },
  desktop: { content: edsDesktop, variant: 'stroke' as const },
  mobile: { content: edsMobile, variant: 'stroke' as const },
  website: { content: edsWebsite, variant: 'stroke' as const },
} as const;

export type EdsIconName = keyof typeof edsIcons;

export const appRailIcons = {
  logo: edsLogo,
  explore: 'open-book',
  started: 'tree',
  motion: 'motion',
  atoms: 'atoms',
  molecules: 'molecules',
  organisms: 'organisms',
  templates: 'templates',
  scenes: 'scenes',
  theme: 'thematic',
} as const satisfies Record<string, EdsIconName | typeof edsLogo>;

export const pageHeaderIcons = {
  design: 'star-fill',
  develop: 'sign-hashtag',
} as const satisfies Record<string, EdsIconName>;

export const scopeIcons = {
  desktop: 'desktop',
  mobile: 'mobile',
  website: 'website',
} as const satisfies Record<string, EdsIconName>;
