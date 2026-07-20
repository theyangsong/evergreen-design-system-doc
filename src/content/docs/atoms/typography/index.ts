import designDesktop from './design.desktop.md?raw';
import designMobile from './design.mobile.md?raw';
import designWebsite from './design.website.md?raw';
import developDesktop from './develop.desktop.md?raw';
import developMobile from './develop.mobile.md?raw';
import developWebsite from './develop.website.md?raw';
import { defineComponentDocPage } from '@/content/docPage';

export const typographyDocPath = '/atoms/typography';

export const typographyDocPage = defineComponentDocPage({
  path: typographyDocPath,
  sectionId: 'atoms',
  title: 'Typography',
  description: 'Typography System 是 EverGreen Design System 的基础字体层，用于定义字号、行高、字重等排版规则，并通过 Token 化方式确保跨设计与开发的一致性。',
  meta: [
    { label: '名称', value: 'Typography' },
    { label: 'ID', value: 'eds-vars-typography' },
    { label: '类型', value: '全局变量' },
    { label: '状态', value: '已启用' },
    { label: '版本', value: 'v1.0' },
    { label: '维护', value: 'EDS Yang' },
    { label: '贡献', value: 'EDS Yang、Sam、Dev.' },
    { label: '最后更新', value: '2026年7月18日' },
  ],
  imageAssetDir: 'typography',
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
