import designDesktop from './design.desktop.md?raw';
import designMobile from './design.mobile.md?raw';
import designWebsite from './design.website.md?raw';
import developDesktop from './develop.desktop.md?raw';
import developMobile from './develop.mobile.md?raw';
import developWebsite from './develop.website.md?raw';
import { defineComponentDocPage } from '@/content/docPage';

export const colorSystemDocPath = '/atoms/color-system';

export const colorSystemDocPage = defineComponentDocPage({
  path: colorSystemDocPath,
  sectionId: 'atoms',
  title: 'Color System',
  description:
    'Color System 是 EverGreen Design System 的基础视觉层，用于定义所有 UI 组件的颜色表达规则，并通过 Token 化方式确保跨设计与开发的一致性。',
  meta: [
    { label: '名称', value: 'Color System' },
    { label: 'ID', value: 'eds-vars-color-system' },
    { label: '类型', value: '全局变量' },
    { label: '状态', value: '已启用' },
    { label: '版本', value: 'v1.1' },
    { label: '维护', value: 'EDS Yang' },
    { label: '贡献', value: 'EDS Yang、Dev.' },
    { label: '最后更新', value: '2026年6月1日' },
  ],
  imageAssetDir: 'color-system',
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
