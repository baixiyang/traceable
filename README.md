wittyna-traceable
## 简介
###### wittyna-traceable可以为复杂结构的js对象的操作提供修改日志，回退、前进等功能。

## 支持的数据
* 普通对象数据
* vue2 格式对象数据
* vue3 格式对象数据

## 安装
```bash
npm install wittyna-traceable
```
## 特性
* 默认在修改开始后的 microtask 结束后会记录一次操作
* 通过start， end 可以自定义一次操作的开始和结束
* 通过 forward， backward 可以进行回退、前进操作
* 通过 history 可以拿到操作历史记录
* 可以设置最大历史记录数

## 使用
###### 可以通过下面测试用例查看
* start，end
[start-end.test.ts](test%2Fstart-end.test.ts)
* 数组情况
[type.array.test.ts](test%2Ftype.array.test.ts)
* 对象情况
[type.object.test.ts](test%2Ftype.object.test.ts)






