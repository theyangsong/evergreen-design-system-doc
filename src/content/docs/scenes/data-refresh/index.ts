import designDesktop from './design.desktop.md?raw';
import designMobile from './design.mobile.md?raw';
import designWebsite from './design.website.md?raw';
import developDesktop from './develop.desktop.md?raw';
import developMobile from './develop.mobile.md?raw';
import developWebsite from './develop.website.md?raw';
import { defineComponentDocPage } from '@/content/docPage';

export const dataRefreshDocPath = '/scenes/data-refresh';

export const dataRefreshDocPage = defineComponentDocPage({
  path: dataRefreshDocPath,
  sectionId: 'scenes',
  title: 'Data Refresh',
  description: 'Data Refresh 的设计与开发指南。',
  meta: [
    { label: '名称', value: 'Data Refresh' },
    { label: 'ID', value: 'eds-biz-data-refresh' },
    { label: '类型', value: '业务组件' },
    { label: '状态', value: '已启用' },
    { label: '版本', value: '1.0' },
    { label: '维护', value: 'EDS Yang' },
    { label: '贡献', value: 'EDS Yang、Sam、Dev.' },
    { label: '最后更新', value: '2026年7月19日' },
  ],
  imageAssetDir: 'scenes/data-refresh',
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
