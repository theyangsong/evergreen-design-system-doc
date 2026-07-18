import designDesktop from './design.desktop.md?raw';
import designMobile from './design.mobile.md?raw';
import designWebsite from './design.website.md?raw';
import developDesktop from './develop.desktop.md?raw';
import developMobile from './develop.mobile.md?raw';
import developWebsite from './develop.website.md?raw';
import { defineComponentDocPage } from '@/content/docPage';

export const svgMorphDocPath = '/motion/svg-morph';

export const svgMorphDocPage = defineComponentDocPage({
  path: svgMorphDocPath,
  sectionId: 'motion',
  title: 'SVG形变动画',
  description: 'SVG形变动画 的设计与开发指南。',
  meta: [
    { label: '名称', value: 'SVG形变动画' },
    { label: 'ID', value: 'eds-motion-svg-morph' },
    { label: '类型', value: 'Motion' },
    { label: '状态', value: 'Draft' },
    { label: '版本', value: '—' },
    { label: '维护', value: '—' },
    { label: '贡献', value: '—' },
    { label: '最后更新', value: '—' },
  ],
  imageAssetDir: 'motion/svg-morph',
  bundles: {
    design: {
      desktop: designDesktop,
      mobile: designMobile,
      website: designWebsite,
    },
    develop: {
      desktop: developDesktop,
      mobile: developMobile,
      website: developWebsite,
    },
  },
});
