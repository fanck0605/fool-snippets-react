import { useCallback, useEffect, useRef, useState } from 'react';

const storeTreeNodes = <T extends { id: ID; children?: T[] }, ID extends string | number>(
  nodeMap: Map<ID, T>,
  nodeList: T[],
) => {
  for (const treeNode of nodeList) {
    nodeMap.set(treeNode.id, treeNode);

    const children = treeNode.children;
    if (children && children.length > 0) {
      storeTreeNodes(nodeMap, children);
    }
  }
};

/**
 * 当树状数据需要异步加载时，更加高效的更新子节点.
 *
 * @author Chuck Fan
 * @version 2022-03-14
 *
 * @param queryData
 */
const useTreeData = <T extends { id: ID; children?: T[] }, ID extends string | number>(
  queryData: (nodeId: ID | null) => Promise<T[]>,
) => {
  /**
   * 所有节点的引用, 便于快速地更新子节点
   */
  const treeNodesRef = useRef<Map<ID, T> | null>(null);
  if (treeNodesRef.current === null) {
    treeNodesRef.current = new Map<ID, T>();
  }

  /**
   * 如果子节点先加载完, 但是它的父节点未加载完, 就会变成孤儿节点
   * 利用这样的机制, 多个子节点的加载工作就不用保证顺序了
   */
  const orphansRef = useRef<Map<ID, T[]> | null>(null);
  if (orphansRef.current === null) {
    orphansRef.current = new Map<ID, T[]>();
  }

  // 树状数据, 最后的结果数据
  const [treeData, setDataInner] = useState<T[]>([]);

  // 有任何的节点加载完毕后, 都必须执行领养操作
  const adoptOrphans = useCallback(() => {
    const treeNodes = treeNodesRef.current!;
    const orphans = orphansRef.current!;

    /**
     * 上一次孤儿节点的数量, 用于判断是否有孤儿节点找到父母
     * 如果有孤儿节点找到父母, 那么这些节点可能会变成其他孤儿节点的父母, 因此要重复查找
     */
    let prevSize: number;
    do {
      prevSize = orphans.size;
      if (prevSize === 0) return;

      for (const [nodeId, children] of orphans) {
        const current = treeNodes.get(nodeId);
        if (current) {
          orphans.delete(nodeId);

          storeTreeNodes(treeNodes, children);
          current.children = children;
        }
      }
    } while (prevSize !== orphans.size);
  }, []);

  // 使用全新的数据, 根节点加载完后调用此方法
  const setTreeData = useCallback(
    (newData: T[]) => {
      const treeNodes = new Map<ID, T>();
      storeTreeNodes(treeNodes, newData);
      treeNodesRef.current = treeNodes;

      adoptOrphans();

      setDataInner(newData);
    },
    [adoptOrphans],
  );

  const updateTreeData = useCallback(
    (nodeId: ID, children: T[]) => {
      const treeNodes = treeNodesRef.current!;
      const orphans = orphansRef.current!;

      const current = treeNodes.get(nodeId);
      if (!current) {
        orphans.set(nodeId, children);
        return;
      }

      storeTreeNodes(treeNodes, children);
      current.children = children;

      adoptOrphans();

      // 必须复制一份, 否则不生效
      setDataInner((prev) => prev.slice());
    },
    [adoptOrphans],
  );

  const unmountedRef = useRef(false);
  useEffect(
    () => () => {
      unmountedRef.current = true;
    },
    [],
  );

  const loadTreeData = useCallback(
    (nodeId: ID | null) =>
      new Promise<T[]>(async (resolve, reject) => {
        try {
          const children = await queryData(nodeId);
          if (unmountedRef.current) {
            /**
             * 如果组件卸载了, 那就让这个 Promise pending 下去吧.
             * 这样子也能防止调用者在后续代码中用了 setState
             * @see https://juejin.cn/post/6979880283667431454
             */
            return;
          }

          if (nodeId === null) {
            setTreeData(children);
          } else {
            updateTreeData(nodeId, children);
          }

          resolve(children);
        } catch (e) {
          if (unmountedRef.current) {
            return;
          }

          reject(e);
        }
      }),
    [queryData, setTreeData, updateTreeData],
  );

  return {
    treeData,
    setTreeData,
    loadTreeData,
  };
};

export default useTreeData;
