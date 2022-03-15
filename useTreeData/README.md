# useTreeData

useTreeData 可以用于异步加载树状数据, 并且高效的更新树状数据

## 示例用法

配合 Antd [级联选择器](https://ant.design/components/cascader-cn/), 进行异步数据加载


https://codesandbox.io/s/usetreedata-xqggzf?file=/src/App.tsx



```tsx
import "./styles.css";
import province from "./province";
import city from "./city";
import useTreeData from "./useTreeData";
import { useEffect } from "react";
import { Cascader } from "antd";

const delay = (t: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
};

const getAllDistrictsByParentId = async (districtId: string | null) => {
  await delay(100);
  return districtId === null
    ? province.map((it: any) => ({ ...it, isLeaf: false }))
    : city[districtId].map((it: any) => ({ ...it, isLeaf: true }));
};

export default function App() {
  const { treeData, loadTreeData } = useTreeData(getAllDistrictsByParentId);

  useEffect(() => {
    // 加载父节点数据
    loadTreeData(null);
  }, [loadTreeData]);

  return (
    <Cascader<{ id: string; name: string; isLeaf: boolean }>
      options={treeData}
      changeOnSelect
      fieldNames={{ label: "name", value: "id" }}
      loadData={(districts) => {
        const district = districts[districts.length - 1];
        const children = district.children;
        // 如果已经加载过了就不重复加载
        if (!children || children.length === 0) {
          loadTreeData(district.id);
        }
      }}
    />
  );
}
```
