import fs from 'fs'
import fsPromises from 'fs/promises'
import fm from 'front-matter'


export type Section = {
  id: string,
  file: string,
  course: string,
  theme: string,
  name: string,
  markdown: string,
  dependsOn: string[],
  tags: string[],
  index: number,
  type: string,
}

export type Course = {
  id: string,
  theme: string,
  name: string,
  dependsOn: string[],
  markdown: string,
  sections: Section[],
  type: string,
}

export type Theme = {
  id: string,
  name: string,
  markdown: string,
  courses: Course[],
  type: string,
}

export type Material = {
  name: string,
  markdown: string,
  themes: Theme[],
  type: string,
}

export function remove_markdown(material: Material, except: Material | Theme | Course | Section) {
  if (except.type !== 'Material') {
    material.markdown = ''
  }
  for (let theme of material.themes) {
    // @ts-expect-error
    if (!(except.type === 'Theme' && except.id == theme.id)) {
        theme.markdown = ''
    }
    for (let course of theme.courses) {
      // @ts-expect-error
      if (!(except.type === 'Course' && except.id == course.id)) {
        course.markdown = ''
      }
      for (let section of course.sections) {
        // @ts-expect-error
        if (!(except.type === 'Section' && except.id == section.id)) {
          section.markdown = ''
        }
      }
    }
  }
}

const materialDir = `${process.env.MATERIAL_DIR}`;

export async function getMaterial(no_markdown=false) : Promise<Material> {
  const dir = `${materialDir}`;
  const rel_dir = `../${materialDir}`;
  const public_dir = `public/material`;
  fs.symlink(rel_dir, public_dir, 'dir', (err) => {
    if (err)
      console.log(err);
    else {
      console.log("\nSymlink created\n");
    }
  });
  const buffer = await fsPromises.readFile(`${dir}/index.md`, {encoding: "utf8"});
  const material = fm(buffer);

  // @ts-expect-error
  const name = material.attributes.name as string
  const markdown = no_markdown ? '' : material.body as string
  // @ts-expect-error
  const themesId = material.attributes.themes as [string];

  const themes = await Promise.all(themesId.map(theme => getTheme(theme, no_markdown)));
  const type = 'Material';

  return { name, markdown, themes, type };
}

export async function getTheme(theme: string, no_markdown=false) : Promise<Theme> {
  const dir = `${materialDir}/${theme}`;
  
  const themeBuffer = await fsPromises.readFile(`${dir}/index.md`, {encoding: "utf8"});
  const themeObject = fm(themeBuffer);
  // @ts-expect-error
  const name = themeObject.attributes.name as string
  const markdown = no_markdown ? '' : themeObject.body as string
  const id = theme;
  // @ts-expect-error
  const coursesId = themeObject.attributes.courses as [string];
  const courses = await Promise.all(coursesId.map(course => getCourse(theme, course)));
  const type = 'Theme';

  return { id, name, markdown, courses, type };
}

export async function getCourse(theme: string, course: string, no_markdown=false) : Promise<Course> {
  const dir = `${materialDir}/${theme}/${course}`;
  const courseBuffer = await fsPromises.readFile(`${dir}/index.md`, {encoding: "utf8"});
  const courseObject = fm(courseBuffer);
  // @ts-expect-error
  const name = courseObject.attributes.name as string
  // @ts-expect-error
  const dependsOn = courseObject.attributes.dependsOn as string[] || [];
  // @ts-expect-error
  const filenames = courseObject.attributes.files as string[] || [];
  const markdown = no_markdown ? '' : courseObject.body as string
  // @ts-expect-error
  const files = courseObject.attributes.files as [string];
  const id = course;
  const sections = await Promise.all(files.map((file, i) => getSection(theme, course, i, file)));
  const type = 'Course';

  return { id, theme, name, sections, dependsOn, markdown, type }
}

// https://stackoverflow.com/questions/21792367/replace-underscores-with-spaces-and-capitalize-words
function humanize(str: string) {
  var i, frags = str.replace(/\.[^/.]+$/, "").split('_');
  for (i=0; i<frags.length; i++) {
    frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
  }
  return frags.join(' ');
}

export async function getSection(theme: string, course: string, index: number, file: string, no_markdown=false) : Promise<Section> {
  const id = file.replace(/\.[^/.]+$/, "");
  const dir = `${materialDir}/${theme}/${course}`;
  const sectionBuffer = await fsPromises.readFile(`${dir}/${file}`, {encoding: "utf8"});
  const sectionObject = fm(sectionBuffer);
  // @ts-expect-error
  const dependsOn = sectionObject.attributes.dependsOn as string[] || [];
  // @ts-expect-error
  const tags = sectionObject.attributes.tags as string[] || [];
  // @ts-expect-error
  const name = sectionObject.attributes.name as string || humanize(file)
  const markdown = no_markdown ? '' : sectionObject.body as string
  const type = 'Section';

  return { id, file, theme, course, name, markdown, index, type, tags, dependsOn }
}