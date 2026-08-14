const path = require('path')
const { readdir, createReadStream, writeFile } = require('fs-extra')
const { createInterface } = require('readline')
const { exec } = require('child_process')
const packageJson = require('../package.json')

const projectName = packageJson.name

const ROOT = path.resolve(__dirname, '..')
const apiDocsDir = path.resolve(ROOT, './docs/docs/API')

async function buildApiDocs() {
  await new Promise((resolve, reject) =>
    exec(
      `pnpm build:type && pnpm exec api-extractor run --local && pnpm exec api-documenter markdown -i configs -o ${apiDocsDir}`,
      (err, stdout, stderr) => {
        console.log(stdout)
        console.error(stderr)
        if (err) {
          reject(err)
        } else {
          resolve(null)
        }
      },
    ),
  )

  const docFiles = await readdir(apiDocsDir)

  for (const docFile of docFiles) {
    try {
      const { name: id, ext } = path.parse(docFile)

      if (ext !== '.md') {
        continue
      }

      const docPath = path.join(apiDocsDir, docFile)
      const input = createReadStream(docPath)

      const output = []
      const lines = createInterface({
        input,
        crlfDelay: Infinity,
      })

      let title = ''
      lines.on('line', (line) => {
        let skip = false
        if (!title) {
          const titleLine = line.match(/## (.*)/)
          if (titleLine) {
            title = titleLine[1]
          }
        }
        const homeLink = line.match(/\[Home\]\(.\/index\.md\) &gt; (.*)/)

        if (homeLink) {
          if (id !== projectName) {
            output.push(homeLink[1])
          }
          skip = true
        }

        line = line.startsWith('|') ? line.replace(/\\\|/g, '&#124;') : line
        line = line.match(/<!-- -->/) ? line.replace(/<!-- -->/g, '') : line

        if (!skip) {
          output.push(line)
        }
      })

      await new Promise((resolve) => lines.once('close', resolve))
      input.close()

      const header = [
        '---',
        `id: ${id}`,
        `title: ${title}`,
        'hide_title: true',
        '---',
      ]

      await writeFile(docPath, header.concat(output).join('\n'))
    } catch (err) {
      console.error(`Could not process ${docFile}: ${err}`)
    }
  }
}

buildApiDocs()
