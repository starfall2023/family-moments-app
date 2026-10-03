import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import PagerView, { PagerViewProps } from 'react-native-pager-view';

export interface VerticalPagerHandle {
  setPage: (n: number) => void;
}

/** 原生端：使用 react-native-pager-view 实现纵向滑动切换 */
const VerticalPager = forwardRef<VerticalPagerHandle, PagerViewProps>((props, ref) => {
  const pagerRef = useRef<PagerView>(null);
  useImperativeHandle(ref, () => ({
    setPage: (n: number) => pagerRef.current?.setPage(n),
  }));
  return <PagerView ref={pagerRef} {...props} orientation="vertical" />;
});

VerticalPager.displayName = 'VerticalPager';
export default VerticalPager;