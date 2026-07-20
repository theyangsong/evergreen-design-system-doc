import designDesktop from './design.desktop.md?raw';
import designMobile from './design.mobile.md?raw';
import designWebsite from './design.website.md?raw';
import developDesktop from './develop.desktop.md?raw';
import developMobile from './develop.mobile.md?raw';
import developWebsite from './develop.website.md?raw';
import { defineComponentDocPage } from '@/content/docPage';

export const dataListDocPath = '/organisms/data-list';

export const dataListDocPage = defineComponentDocPage({
  path: dataListDocPath,
  sectionId: 'organisms',
  title: 'Data List',
  description:
    'eds-org-data-list 是一个响应式只读数据列表，用于在固定宽度容器内展示结构化数据，支持多选、批处理、列排序与渐进式响应式适配。',
  meta: [
    { label: '名称', value: 'Data List' },
    { label: 'ID', value: 'eds-org-data-list' },
    { label: '类型', value: 'Organisms' },
    { label: '状态', value: '已启用' },
    { label: '版本', value: 'v1.0' },
    { label: '维护', value: 'EDS Yang' },
    { label: '贡献', value: 'EDS Yang、Sam、Jojo、Dev.' },
    { label: '最后更新', value: '2026/6/9' },
  ],
  imageAssetDir: 'organisms/data-list',
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
