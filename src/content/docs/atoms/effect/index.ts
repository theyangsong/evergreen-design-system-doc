import designDesktop from './design.desktop.md?raw';
import designMobile from './design.mobile.md?raw';
import designWebsite from './design.website.md?raw';
import developDesktop from './develop.desktop.md?raw';
import developMobile from './develop.mobile.md?raw';
import developWebsite from './develop.website.md?raw';
import { defineComponentDocPage } from '@/content/docPage';

export const effectDocPath = '/atoms/effect';

export const effectDocPage = defineComponentDocPage({
  path: effectDocPath,
  sectionId: 'atoms',
  title: 'Effect',
  description: 'Effect 定义阴影、玻璃材质、背景模糊等视觉效果 Token 与语义组合类，确保跨组件视觉深度一致。',
  meta: [
    { label: '名称', value: 'Effect' },
    { label: 'ID', value: 'eds-vars-effect' },
    { label: '类型', value: '全局变量' },
    { label: '状态', value: '已启用' },
    { label: '版本', value: 'v1.0' },
    { label: '维护', value: 'EDS Yang' },
    { label: '贡献', value: 'EDS Yang、Sam、Dev.' },
    { label: '最后更新', value: '2026年7月18日' },
  ],
  imageAssetDir: 'effect',
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
