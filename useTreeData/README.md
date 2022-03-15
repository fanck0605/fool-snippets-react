# useTreeData

useTreeData 可以用于异步加载树状数据, 并且高效的更新树状数据

## 示例用法

配合 Antd [级联选择器](https://ant.design/components/cascader-cn/), 进行异步数据加载


https://codesandbox.io/s/usetreedata-xqggzf?file=/src/App.tsx



```tsx
import React, { useState, useEffect } from "react";
import { Button, message, Space, Cascader } from "antd";
import { ProFormText, ModalForm } from "@ant-design/pro-form";
import useTreeData from "./useTreeData";
import province from "./province";
import city from "./city";

const delay = (t: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
};

const getAllDistricts = async (districtId: string | null) => {
  await delay(100);
  const response = districtId === null ? province : city[districtId];
  return response.data;
};

export default () => {
  const { treeData, loadTreeData } = useTreeData(getAllDistricts);

  useEffect(() => {
    // 加载父节点数据
    loadTreeData(null);
  }, [loadTreeData]);

  return (
    <Cascader<any>
      options={treeData}
      expandTrigger="hover"
      fieldNames={{ label: "name", value: "id" }}
      loadData={(districts) => {
        const district = districts[districts.length - 1];
        const children = district.children;
        if (!children || children.length === 0) {
          loadTreeData(district.id);
        }
      }}
    />
  );
};
```
