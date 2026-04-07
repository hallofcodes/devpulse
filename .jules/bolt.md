## 2024-04-07 - Filtering Performance Optimization in Chat Component
**Learning:** Extracting inline array filtering (O(N) operations) out of the return statement into a `useMemo` hook reduces UI lag during text entry by preventing re-computation on unrelated state changes (like typing). Early returning the unmodified array when no filter is applied allows child components to bail out of re-rendering.
**Action:** Always scan for unmemoized O(N) array transformations inside JSX props, especially when the parent component has rapidly changing states like text inputs.
