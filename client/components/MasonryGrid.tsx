import React, { useMemo, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { masonryRatio } from '@/utils/format';

interface Props<T> {
  items: T[];
  numColumns?: number;
  gap?: number;
  renderItem: (item: T, width: number, height: number) => React.ReactNode;
  /** 根据 item 计算高度因子 */
  ratioOf?: (item: T) => number;
}

/** N 列瀑布流：按高度因子贪心分配到较短的一列，保证交错 */
export function MasonryGrid<T extends { id: number }>({
  items,
  numColumns = 2,
  gap = 10,
  renderItem,
  ratioOf,
}: Props<T>) {
  const ratio = ratioOf ?? ((i: T) => masonryRatio(i.id));
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const cellW = width > 0 ? (width - gap * (numColumns - 1)) / numColumns : 0;

  const columns = useMemo(() => {
    const cols: T[][] = Array.from({ length: numColumns }, () => []);
    const heights = new Array(numColumns).fill(0);
    for (const item of items) {
      const h = cellW / ratio(item);
      let ci = 0;
      for (let j = 1; j < numColumns; j++) if (heights[j] < heights[ci]) ci = j;
      cols[ci].push(item);
      heights[ci] += h + gap;
    }
    return cols;
  }, [items, numColumns, gap, cellW, ratio]);

  if (cellW <= 0) {
    return <View style={styles.row} onLayout={onLayout} />;
  }

  return (
    <View style={styles.row} onLayout={onLayout}>
      {columns.map((col, ci) => (
        <View key={ci} style={{ flex: 1, gap }}>
          {col.map((item) => {
            const h = cellW / ratio(item);
            return (
              <View key={String(item.id)} style={{ width: cellW, height: h }}>
                {renderItem(item, cellW, h)}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
});