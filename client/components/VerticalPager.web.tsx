import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { ScrollView, View, useWindowDimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export interface VerticalPagerHandle {
  setPage: (n: number) => void;
}

interface PageSelectedEvent {
  nativeEvent: { position: number };
}

interface Props {
  children?: React.ReactNode | React.ReactNode[];
  style?: any;
  initialPage?: number;
  onPageSelected?: (e: PageSelectedEvent) => void;
}

/** Web 端：不引用原生 pager-view，用带分页的纵向 ScrollView 模拟沉浸式切换 */
const VerticalPager = forwardRef<VerticalPagerHandle, Props>(({ children, style, initialPage = 0, onPageSelected }, ref) => {
  const { height } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const pages = React.Children.toArray(children);

  useImperativeHandle(ref, () => ({
    setPage: (n: number) => scrollRef.current?.scrollTo({ y: n * height, animated: true }),
  }));

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: initialPage * height, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPage, height]);

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / height);
    onPageSelected?.({ nativeEvent: { position: idx } });
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={style}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      bounces={false}
      onMomentumScrollEnd={handleScrollEnd}
    >
      {pages.map((p, i) => (
        <View key={i} style={{ height, width: '100%' }}>
          {p}
        </View>
      ))}
    </ScrollView>
  );
});

VerticalPager.displayName = 'VerticalPager';
export default VerticalPager;