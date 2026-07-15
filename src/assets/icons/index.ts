import edsBizMod from './eds-biz-mod.svg?raw';
import edsLight from './eds-light.svg?raw';
import edsLogo from './eds-logo.svg';
import edsOpenBook from './eds-open-book.svg?raw';
import edsSignHashtag from './eds-sign-hashtag.svg?raw';
import edsStarFill from './eds-star-fill.svg?raw';
import edsTree from './eds-tree.svg?raw';
import ovalAtoms from './oval-atoms.svg?raw';
import ovalMolecules from './oval-molecules.svg?raw';
import ovalOrganisms from './oval-organisme.svg?raw';
import ovalTemplates from './oval-templates.svg?raw';

export type EdsIconVariant = 'stroke' | 'fill' | 'mixed';

export const edsIcons = {
  'open-book': { content: edsOpenBook, variant: 'stroke' as const },
  tree: { content: edsTree, variant: 'stroke' as const },
  atoms: { content: ovalAtoms, variant: 'stroke' as const },
  molecules: { content: ovalMolecules, variant: 'stroke' as const },
  organisms: { content: ovalOrganisms, variant: 'stroke' as const },
  templates: { content: ovalTemplates, variant: 'stroke' as const },
  scenes: { content: edsBizMod, variant: 'stroke' as const },
  light: { content: edsLight, variant: 'mixed' as const },
  'star-fill': { content: edsStarFill, variant: 'fill' as const },
  'sign-hashtag': { content: edsSignHashtag, variant: 'stroke' as const },
} as const;

export type EdsIconName = keyof typeof edsIcons;

export const appRailIcons = {
  logo: edsLogo,
  explore: 'open-book',
  started: 'tree',
  atoms: 'atoms',
  molecules: 'molecules',
  organisms: 'organisms',
  templates: 'templates',
  scenes: 'scenes',
  theme: 'light',
} as const satisfies Record<string, EdsIconName | typeof edsLogo>;

export const pageHeaderIcons = {
  design: 'star-fill',
  develop: 'sign-hashtag',
} as const satisfies Record<string, EdsIconName>;
