export type Interval = [start: number, end: number];
export function merge(intervals: Interval[]) {
  if (intervals.length === 0) return [];
  intervals.sort(([a], [b]) => a - b);
  const stack = [[...intervals[0]]];
  for (let i = 1; i < intervals.length; i++) {
    const c = intervals[i];
    const t = stack[stack.length - 1];
    if (t[1] < c[0]) {
      stack.push([...c]);
    } else if (t[1] < c[1]) {
      t[1] = c[1];
    }
  }
  return stack;
}
