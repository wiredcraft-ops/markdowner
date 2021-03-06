#!/usr/bin/env node
const pkg = require('./package.json')
const commander = require('commander')
const toc = require('markdown-toc')
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
    const option = { path: commander.buildDir, assetsUrl: commander.assetsUrl }
    if (commander.puppeteerConfig) {
        if (!fs.existsSync(commander.puppeteerConfig)) {
            exit(`Puppeteer config file ${cmd.puppeteerConfig} doesn't exist`)
        }

        option.puppeteerConfig = JSON.parse(fs.readFileSync(commander.puppeteerConfig))
    }
    contents.forEach((vaule) => {
        output.push(mdRender(vaule, option))
    })
    for (let c of output) {
        if (!commander.withoutToc) {
            c = `${toc(c).content}\n${c}`
        }
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
    .option('--assets-url [assetsUrl]', 'the assets url will be used by image url')
    .option('--without-toc', 'Without table of contents')
    .option('--swagger-template [swaggerTemplate]', 'Template from swagger to markdown')
    .option('-p, --puppeteer-config [puppeteer-config]', 'Customer Config of Puppeteer')
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
