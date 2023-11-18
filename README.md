# myreact
手撕一个mini版本的React 18，workspace 使用pnpm整个Monorepo；打包工具使用rollup，代码调试使用vite；

> 说明：
>
> ​	rollup 打包出来的js相对简单一点，大包体积相对于webpack 更小。
>
> ​	pnpm 相对对于npm，yarn更快，它是通过link形势引入的并非树形，而且自带monorepo
>
> ​	调试项目使用vite，vite在开发环境中直接将源代码转换为esmodule交给浏览器，更快更方便动态的对源码调试。
>
> 

## 项目工程化方面

pnpm workspace Monorepo rollup

packages ：react，react-dom，react-reconciler，shared，

目前进度：

- [x] 项目初始化
- [x] jsx编写（React.createElement）
- [x] fier结构
- [x] 完成jsx到首屏渲染（workLoop中beginwork，completework，commit）
- [x] 新增vite调试（使用vite初始化一个react项目，在引入react和react-dom 时候引入我们自己写的react）
- [x] 使用jest跑完React官网ReactElement相关测试用例
- [x] 新增useState钩子函数（mount阶段useState和update阶段的useState）
- [x] 完成单节点update（单节点diff，复用fiber）
- [x] 实现事件系统（实现onclick onclickcapture）
- [x] 多接点diff算法
- [ ] 实现Fragment
- [ ] 调度模型 lane
- [ ] useEffect钩子函数
- [ ] 并发更新
