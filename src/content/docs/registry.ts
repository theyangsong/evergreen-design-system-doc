import {
  colorSystemDocPage,
  colorSystemDocPath,
} from './atoms/color-system';
import {
  dataListDocPage,
  dataListDocPath,
} from './organisms/data-list';
import {
  fadeDocPage,
  fadeDocPath,
} from './motion/fade';
import {
  translateDocPage,
  translateDocPath,
} from './motion/translate';
import {
  timelineDocPage,
  timelineDocPath,
} from './motion/timeline';
import {
  easingDocPage,
  easingDocPath,
} from './motion/easing';
import {
  valueChangeDocPage,
  valueChangeDocPath,
} from './motion/value-change';
import {
  svgLinearDocPage,
  svgLinearDocPath,
} from './motion/svg-linear';
import {
  svgMorphDocPage,
  svgMorphDocPath,
} from './motion/svg-morph';
import {
  pathMotionDocPage,
  pathMotionDocPath,
} from './motion/path-motion';
import {
  encapsulationDocPage,
  encapsulationDocPath,
} from './motion/encapsulation';
import {
  pageTransitionDocPage,
  pageTransitionDocPath,
} from './motion/page-transition';
import {
  drawerDocPage,
  drawerDocPath,
} from './motion/drawer';
import {
  blockTranslateDocPage,
  blockTranslateDocPath,
} from './motion/block-translate';
import {
  scaleSystemDocPage,
  scaleSystemDocPath,
} from './atoms/scale-system';
import {
  typographyDocPage,
  typographyDocPath,
} from './atoms/typography';
import {
  textDocPage,
  textDocPath,
} from './atoms/text';
import {
  effectDocPage,
  effectDocPath,
} from './atoms/effect';
import {
  navBarDocPage,
  navBarDocPath,
} from './organisms/nav-bar';
import {
  moduleMenuDocPage,
  moduleMenuDocPath,
} from './organisms/module-menu';
import {
  dataTableViewDocPage,
  dataTableViewDocPath,
} from './organisms/data-table-view';
import {
  dataTableEditDocPage,
  dataTableEditDocPath,
} from './organisms/data-table-edit';
import {
  batchBarDocPage,
  batchBarDocPath,
} from './organisms/batch-bar';
import {
  dataSubmissionDocPage,
  dataSubmissionDocPath,
} from './scenes/data-submission';
import type { DocPageConfig } from '@/config/navigation';

/** Component doc pages with per-platform markdown bundles. */
export const componentDocPages: Record<string, DocPageConfig> = {
  [dataSubmissionDocPath]: dataSubmissionDocPage,
  [batchBarDocPath]: batchBarDocPage,
  [dataTableEditDocPath]: dataTableEditDocPage,
  [dataTableViewDocPath]: dataTableViewDocPage,
  [moduleMenuDocPath]: moduleMenuDocPage,
  [navBarDocPath]: navBarDocPage,
  [effectDocPath]: effectDocPage,
  [textDocPath]: textDocPage,
  [typographyDocPath]: typographyDocPage,
  [scaleSystemDocPath]: scaleSystemDocPage,
  [blockTranslateDocPath]: blockTranslateDocPage,
  [drawerDocPath]: drawerDocPage,
  [pageTransitionDocPath]: pageTransitionDocPage,
  [encapsulationDocPath]: encapsulationDocPage,
  [pathMotionDocPath]: pathMotionDocPage,
  [svgMorphDocPath]: svgMorphDocPage,
  [svgLinearDocPath]: svgLinearDocPage,
  [valueChangeDocPath]: valueChangeDocPage,
  [easingDocPath]: easingDocPage,
  [timelineDocPath]: timelineDocPage,
  [translateDocPath]: translateDocPage,
  [fadeDocPath]: fadeDocPage,
  [colorSystemDocPath]: colorSystemDocPage,
  [dataListDocPath]: dataListDocPage,
};
