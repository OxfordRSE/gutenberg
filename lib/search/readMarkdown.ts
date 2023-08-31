import fs from 'fs';
import path from 'path';

export function getDocsList(materialDir: string): string[] {  
  const markdownFiles: string[] = [];

  function traverseDirectory(currentPath: string) {
      const files = fs.readdirSync(currentPath);

      files.forEach((file) => {
          const filePath = path.join(currentPath, file);
          const stats = fs.statSync(filePath);

          if (stats.isDirectory()) {
              traverseDirectory(filePath);
          } else if (path.extname(file) === '.md') {
              markdownFiles.push(filePath);
          }
      });
  }

  traverseDirectory(materialDir);
  return markdownFiles;
}


function removeFooter(pageMd: string): string {
    return pageMd.split("[Next ![]")[0];
}
  
function removeHeader(pageMd: string): string {
    const sections = pageMd.split("---");
    const cleanedMd = sections.splice(2).join('\n');
    return cleanedMd
}

function removeLineNumbers(pageMd: string): string {
    const lines = pageMd.split('\n');
    const cleanedLines = lines.map(line => line.replace(/^\s*\d+\s*/, ''));
    
    const cleanedPageMd = cleanedLines.join('\n');
    return cleanedPageMd;
}

function removeChallenge(pageMd: string): string {
    const lines = pageMd.split('\n');

    // TODO: this only removes the lines containing the directive and not the contents of the directive block
    let cleanedLines = lines.filter(line => !line.includes('::::challenge'));
    cleanedLines = cleanedLines.filter(line => !line.includes(':::solution'));
    const cleanedPageMd = cleanedLines.join('\n');
    return cleanedPageMd;
}

function removeDirectives(pageMd: string): string {
    const lines = pageMd.split('\n');
    const cleanedLines = lines.filter(line => !line.includes('::'));
    const cleanedPageMd = cleanedLines.join('\n');
    return cleanedPageMd;
}

function removeTableRows(pageMd: string): string {
    const lines = pageMd.split('\n');
    const cleanedLines = lines.map(line => (line.length === 0 || !/^\|\s.*\s\|$/.test(line)) ? line : '');
    
    const cleanedPageMd = cleanedLines.join('\n');
    return cleanedPageMd;
}

function removeEscapedChars(pageMd: string): string {
    const cleanedPageMd = pageMd.replace(/\\_/g, "_").replace(/\\\*/g, "*");
    return cleanedPageMd;
}

function removeLinks(pageMd: string): string {
    const linkPattern = /\[.*?\]\(.*?\)/;
    const match = pageMd.match(linkPattern);
  
    if (match) {
      const [link] = match;
      const [start, end] = match.index !== undefined ? [match.index, match.index + link.length] : [0, 0];
      const linkText = link.slice(1).split(']')[0];
  
      if (linkText !== "¶") {
        return pageMd.slice(0, start) + linkText + removeLinks(pageMd.slice(end));
      } else {
        return pageMd.slice(0, end) + link + removeLinks(pageMd.slice(end));
      }
    }
  
    return pageMd;
}

function parseMarkdown(pageMd: string): string {
        let cleanedMd = removeFooter(pageMd);
        cleanedMd = removeHeader(cleanedMd);
        cleanedMd = removeLineNumbers(cleanedMd);
        cleanedMd = removeTableRows(cleanedMd);
        cleanedMd = removeLinks(cleanedMd);
        cleanedMd = removeChallenge(cleanedMd);
        // want to deal with challenges properly but for now this is redundant.
        cleanedMd = removeDirectives(cleanedMd);
        cleanedMd = removeEscapedChars(cleanedMd);
      
        return cleanedMd;
}

export function readPageMarkdown(mdFile: string): string {
    try {
      const pageMd = fs.readFileSync(mdFile, 'utf-8');
      const parsedPage = parseMarkdown(pageMd);
      return parsedPage;
    } catch (error) {
      console.error(`Error reading file or parsing Markdown: ${error}`);
      return '';
    }
}