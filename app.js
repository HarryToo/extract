const fs = require('fs');
const {entry, output, excludeFiles, excludePaths} = require('./config');

const blankLineReg = /\n\s*\r/g;
let fileCount = 0;
let readData = '';

async function read(path) {
    const dir = await fs.promises.opendir(path);
    for await (const dirent of dir) {
        if (dirent.isFile()) {
            if (!excludeFiles.includes(dirent.name)) {
                fileCount++;
                const filePath = path + '/' + dirent.name;
                const readerStream = fs.createReadStream(filePath, 'utf8');
                readerStream.on('data', (chunk) => {
                    const relativeFilePath = filePath.replace(entry, '');
                    readData += `\n--------------------- ${relativeFilePath} ---------------------\n`;
                    readData += chunk.replace(blankLineReg, '');
                });
            }
        } else {
            if (!excludePaths.includes(dirent.name)) {
                const childPath = path + '/' + dirent.name;
                await read(childPath);
            }
        }
    }
}

async function extract() {
    await read(entry);
    const writerStream = fs.createWriteStream(output, 'utf8');
    writerStream.write(readData, 'utf8', () => {
        console.log(`执行完毕，提取文件总数：${fileCount}`);
    });
}

extract();

