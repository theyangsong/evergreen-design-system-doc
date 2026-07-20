import designDesktop from './design.desktop.md?raw';
import designMobile from './design.mobile.md?raw';
import designWebsite from './design.website.md?raw';
import developDesktop from './develop.desktop.md?raw';
import developMobile from './develop.mobile.md?raw';
import developWebsite from './develop.website.md?raw';
import { defineComponentDocPage } from '@/content/docPage';

export const listFieldsDocPath = '/scenes/list-fields';

export const listFieldsDocPage = defineComponentDocPage({
  path: listFieldsDocPath,
  sectionId: 'scenes',
  title: 'List Fields',
  description: 'List Fields 的设计与开发指南。',
  meta: [
    { label: '名称', value: 'List Fields' },
    { label: 'ID', value: 'eds-biz-list-fields' },
    { label: '类型', value: '业务组件' },
    { label: '状态', value: '已启用' },
    { label: '版本', value: '1.0' },
    { label: '维护', value: 'EDS Yang' },
    { label: '贡献', value: 'EDS Yang、Sam、Dev.' },
    { label: '最后更新', value: '2026年7月19日' },
  ],
  imageAssetDir: 'scenes/list-fields',
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
