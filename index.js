#!/usr/bin/env node
const pkg = require('./package.json')
const commander = require('commander')
const fs = require('fs')
const mdRender = require('markdowner-pretty/render')
const swg2md = require('swg2md')



function read(f) {
    if (!fs.existsSync(f)) {
        return
    }
    return fs.readFileSync(f, 'utf8')
}

function renderToMD(contents) {
    const output = []
    contents.forEach((vaule) => {
        output.push(mdRender(vaule, { path: commander.buildDir }))
    })
    for (let c of output) {
        console.log(c)
    }

}

function exit(info) {
    console.log(info)
    process.exit(0)
}
commander
    .version(pkg.version)
    .option('--build-dir [buildDir]', 'The assets output path')
    .option('--swagger', 'Parse swagger file')
    .option('--swagger-template [swaggerTemplate]', 'Template from swagger to markdown')
    .parse(process.argv)


async function main() {
    const output = []
    if (commander.args.length < 1) {
        exit('Need at last one swagger or markdown file')
    }

    const tasks = []
    let contents = []
    for (f of commander.args) {
        let content = read(f)
        if (!content) {
            console.log(`${f} is not exist`)
            break
        }

        if (commander.swagger) {
            let swaggerTemplate = commander.swaggerTemplate || require.resolve("./templateSwagger.mustache")
            content = await swg2md.render(f, { templateFile: swaggerTemplate })
            tasks.push(content)

        } else {
            contents.push(content)
        }
    }

    if (commander.swagger) {
        Promise.all(tasks).then(renderToMD)
    } else {
        renderToMD(contents)
    }
}



main();
