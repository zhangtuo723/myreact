import { getBaseRollupPlugins, getPackageJSON, resolvePkgPath } from "./utils"
import generatePackageJson from "rollup-plugin-generate-package-json"
const {name,module} = getPackageJSON('react')
// react 包路径
const pkgPath = resolvePkgPath(name)
// react 产物路径
const pkgDistPath = resolvePkgPath(name,true)
export default [
    {
        input:`${pkgPath}/${module}`,
        output: {
            file:`${pkgDistPath}/index.js`,
            name:'React',
            format:'umd'
        },
        plugins:[...getBaseRollupPlugins(),generatePackageJson({
            inputFolder:pkgPath,
            outputFolder:pkgDistPath,
            baseContents:({name,description,version})=>({
                name,
                description,
                version,
                main:'index.js'
            })
        })]
    },
    // jsx-runtime
    {
        input:`${pkgPath}/src/jsx.ts`,
        plugins:getBaseRollupPlugins(),
        output:[
            // jsx-runtime
            {
                file:`${pkgDistPath}/jsx-runtime.js`,
                name:'jsx-runtime',
                formate:'umd'
            },
            {
                file:`${pkgDistPath}/jsx-dev-runtime.js`,
                name:'jsx-runtime',
                formate:'umd'
            },
        ]
    }
]