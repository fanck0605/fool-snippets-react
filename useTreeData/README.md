# useTreeData

useTreeData 可以用于异步加载树状数据, 并且高效的更新树状数据

## 示例用法

配合 Antd [级联选择器](https://ant.design/components/cascader-cn/), 进行异步数据加载 

```tsx
import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import type { CascaderProps } from 'antd';
import { Cascader } from 'antd';
import useTreeData from '@/hooks/useTreeData';
import { findAllDistrictsByParentId, findAllRootDistricts } from '@/services';

const getAllDistricts = async (districtId: string | null) => {
  const response =
    districtId === null
      ? await findAllRootDistricts()
      : await findAllDistrictsByParentId({ districtId });
  return response.data;
};

export const DistrictSelect: FC<CascaderProps<API.District>> = ({ value, ...props }) => {
  const { treeData, loadTreeData } = useTreeData(getAllDistricts);

  useEffect(() => {
    void loadTreeData(null);
  }, [loadTreeData]);

  return (
    <Cascader<API.District>
      {...props}
      value={value}
      options={treeData}
      expandTrigger="hover"
      fieldNames={{ label: 'name', value: 'id' }}
      loadData={(districts) => {
        const district = districts[districts.length - 1];
        const children = district.children;
        if (!children || children.length === 0) {
          void loadTreeData(district.id);
        }
      }}
    />
  );
};
```