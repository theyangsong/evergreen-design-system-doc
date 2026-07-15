import { inject, ref, type Ref } from 'vue';

export const pageEnterAnimationKey = Symbol('pageEnterAnimationEnabled');

export function usePageEnterAnimation(): Ref<boolean> {
  return inject(pageEnterAnimationKey, ref(false));
}
