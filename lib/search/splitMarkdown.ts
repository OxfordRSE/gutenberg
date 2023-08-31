import { v4 as uuid } from 'uuid';
import * as fs from 'fs';

import { getDocsList, readPageMarkdown } from "./readMarkdown";
import { createSectionVector } from "./createVectors";

export type SectionObj = {
  id: string;
  vector: number[];
  payload: {text: string,
            title?: string,
            url: string,
            section_anchor: string,
            block_type: string}
  
};

const materialDir = `${process.env.MATERIAL_DIR}`;

export async function materialToJson() {
  let sections = parsePages();
  sections = await createSectionVector(sections); 
  const json = await sectionsToJson(sections);
  // TODO: check if the JSON is newer than the older JSON
  console.log('making json')
  fs.writeFileSync('material.json', json);
}

export function parsePages() {
  const fileList = getDocsList(materialDir);
  let sectionsList: SectionObj[][] = [];
  for (const file of fileList) {
    const pageMd = readPageMarkdown(file)
    const sections = splitPageIntoSections(pageMd);
    sectionsList.push(createSections(sections, file))
  }
  console.log(sectionsList.flat().length)
  console.log(sectionsList.flat()[300])
  return sectionsList.flat();
}

function getPageUrl(filepath: string, anchor: string = ''): string {
  const urlBase = `/material${filepath.split(materialDir)[1]}`.split('.md')[0];  
  if (anchor) {
      return `${urlBase}#${anchor}`;
  } else {
      return urlBase;
  }
}

function extractTitleAndAnchor(header: string): [string, string] {
    const title = header.replace(/#/g, '').trim();
    const anchor = title.replace(/ /g, '-').replace(/:/g, '').replace(/`/g,'').toLowerCase();
    return [title, anchor];
}

function splitTextCodeBlocks(pageMd: string): [string[], string[]] {
  const textAndCode = pageMd.split(/```|~~~/);
  const text = textAndCode.filter((_, index) => index % 2 === 0);
  const code = textAndCode.filter((_, index) => index % 2 !== 0);
  return [text, code];
}

export function splitPageIntoSections(pageMd: string): Record<string, string> {
    const [text, code] = splitTextCodeBlocks(pageMd);

    const sections: Record<string, string> = {};
    let currSectionContent = '';
    let sectionKey: string | null = null;
  
    for (let i = 0; i < text.length; i++) {
      const textBlockLines = text[i].split('\n');
      for (const line of textBlockLines) {
        if (line.trim().startsWith("#")) {
          if (currSectionContent !== '') {
            sections[sectionKey!] = currSectionContent;
            currSectionContent = '';
          }
  
          const [title, anchor] = extractTitleAndAnchor(line);
          currSectionContent += `${title}:`;
          sectionKey = anchor;
        } else {
          // line is a title so we use it as a new section
          if (line.trim().startsWith("#") && line.includes(" ")) {
            currSectionContent += `\n${line.split(" ")[1]}:`;
          } else {
            currSectionContent += `\n${line}`;
          }
        }
      }
  
      if (i < code.length) {
        // TODO: make each code block a section with the same anchor tag as the preceding content
        currSectionContent += `\n\`\`\`${code[i]}\`\`\``;
      }
    }
  
    if (sectionKey !== null) {
      sections[sectionKey] = currSectionContent;
    }
  
    return sections;
}

function createSections(sections: Record<string, string>, file: string): SectionObj[] {
  const sectionsList: SectionObj[] = [];
  for (const [sectionAnchor, sectionContent] of Object.entries(sections)) {
    const pageUrl = getPageUrl(file, sectionAnchor);
    const blockType = 'text';
    const section = createSection(sectionContent, sectionAnchor, pageUrl, blockType);
    sectionsList.push(section);
  }
  return sectionsList;
}

function createSection(
  sectionContent: string,
  sectionAnchor: string,
  pageUrl: string,
  blockType: string
  ) {
  const id = uuid();
  const section: SectionObj = {
    id: id,
    vector: [],
    payload: {text: sectionContent,
              url: pageUrl,
              section_anchor: sectionAnchor,
              block_type: blockType,}  
  };
  return section
}

async function sectionsToJson(sections: SectionObj[] | SectionObj) {
  const json = JSON.stringify(sections)
  return json
}

export function jsonToSections(file: string) {
  const json = fs.readFileSync(file, 'utf8')
  const sections = JSON.parse(json)
  return sections
}
