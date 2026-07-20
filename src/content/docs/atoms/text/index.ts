import designDesktop from './design.desktop.md?raw';
import designMobile from './design.mobile.md?raw';
import designWebsite from './design.website.md?raw';
import developDesktop from './develop.desktop.md?raw';
import developMobile from './develop.mobile.md?raw';
import developWebsite from './develop.website.md?raw';
import { defineComponentDocPage } from '@/content/docPage';

export const textDocPath = '/atoms/text';

export const textDocPage = defineComponentDocPage({
  path: textDocPath,
  sectionId: 'atoms',
  title: 'Text Styles',
  description: 'Text Styles 将 Typography System 语义变量组合为可直接引用的文本样式类，供设计与开发在 UI 中一致应用排印规范。',
  meta: [
    { label: '名称', value: 'Text Styles' },
    { label: 'ID', value: 'eds-vars-text' },
    { label: '类型', value: '全局变量' },
    { label: '状态', value: '已启用' },
    { label: '版本', value: '1.0' },
    { label: '维护', value: 'EDS Yang' },
    { label: '贡献', value: 'EDS Yang、Sam、Dev.' },
    { label: '最后更新', value: '2026年7月18日' },
  ],
  imageAssetDir: 'text',
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
