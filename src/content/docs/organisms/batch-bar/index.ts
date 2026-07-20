import designDesktop from './design.desktop.md?raw';
import designMobile from './design.mobile.md?raw';
import designWebsite from './design.website.md?raw';
import developDesktop from './develop.desktop.md?raw';
import developMobile from './develop.mobile.md?raw';
import developWebsite from './develop.website.md?raw';
import { defineComponentDocPage } from '@/content/docPage';

export const batchBarDocPath = '/organisms/batch-bar';

export const batchBarDocPage = defineComponentDocPage({
  path: batchBarDocPath,
  sectionId: 'organisms',
  title: 'BatchBar',
  description: 'BatchBar 的设计与开发指南。',
  meta: [
    { label: '名称', value: 'BatchBar' },
    { label: 'ID', value: 'eds-org-batch-bar' },
    { label: '类型', value: '基础组件' },
    { label: '状态', value: '已启用' },
    { label: '版本', value: '1.0' },
    { label: '维护', value: 'EDS Yang' },
    { label: '贡献', value: 'EDS Yang、Sam、Dev.' },
    { label: '最后更新', value: '2026年7月18日' },
  ],
  imageAssetDir: 'organisms/batch-bar',
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
