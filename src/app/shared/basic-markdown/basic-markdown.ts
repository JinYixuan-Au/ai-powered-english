import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';

interface MarkdownSegment {
  text: string;
  bold: boolean;
  italic: boolean;
}

interface MarkdownListItem {
  content: MarkdownSegment[];
  children: MarkdownList[];
}

interface MarkdownList {
  ordered: boolean;
  items: MarkdownListItem[];
}

interface MarkdownBlock {
  type: 'paragraph' | 'list';
  lines: MarkdownSegment[][];
  list: MarkdownList;
}

interface ParsedListLine {
  indent: number;
  ordered: boolean;
  content: string;
}

@Component({
  imports: [NgTemplateOutlet],
  selector: 'app-basic-markdown',
  styleUrl: './basic-markdown.scss',
  templateUrl: './basic-markdown.html',
})
export class BasicMarkdown {
  readonly text = input('');
  protected readonly blocks = computed(() => this.parseBlocks(this.text()));

  private parseBlocks(value: string): MarkdownBlock[] {
    const lines = value.replace(/\r\n?/g, '\n').split('\n');
    const blocks: MarkdownBlock[] = [];
    let index = 0;

    while (index < lines.length) {
      if (!lines[index].trim()) {
        index += 1;
        continue;
      }

      const listLine = this.parseListLine(lines[index]);
      if (listLine) {
        const parsed = this.parseList(lines, index, listLine.indent, listLine.ordered);
        blocks.push({
          type: 'list',
          lines: [],
          list: parsed.list,
        });
        index = parsed.nextIndex;
        continue;
      }

      const paragraph: MarkdownSegment[][] = [];
      while (index < lines.length && lines[index].trim() && !this.parseListLine(lines[index])) {
        paragraph.push(this.parseInline(lines[index]));
        index += 1;
      }
      blocks.push({
        type: 'paragraph',
        lines: paragraph,
        list: { ordered: false, items: [] },
      });
    }

    return blocks;
  }

  private parseList(
    lines: string[],
    startIndex: number,
    baseIndent: number,
    ordered: boolean,
  ): { list: MarkdownList; nextIndex: number } {
    const list: MarkdownList = { ordered, items: [] };
    let index = startIndex;

    while (index < lines.length) {
      if (!lines[index].trim()) {
        let nextContent = index + 1;
        while (nextContent < lines.length && !lines[nextContent].trim()) nextContent += 1;
        const nextListLine = this.parseListLine(lines[nextContent] ?? '');
        if (nextListLine && nextListLine.indent >= baseIndent) {
          index = nextContent;
          continue;
        }
        return { list, nextIndex: nextContent };
      }

      const listLine = this.parseListLine(lines[index]);
      if (!listLine || listLine.indent < baseIndent) return { list, nextIndex: index };

      if (listLine.indent > baseIndent) {
        const parentItem = list.items.at(-1);
        if (!parentItem) return { list, nextIndex: index };
        const child = this.parseList(lines, index, listLine.indent, listLine.ordered);
        parentItem.children.push(child.list);
        index = child.nextIndex;
        continue;
      }

      if (listLine.ordered !== ordered) return { list, nextIndex: index };
      list.items.push({ content: this.parseInline(listLine.content), children: [] });
      index += 1;
    }

    return { list, nextIndex: index };
  }

  private parseListLine(line: string): ParsedListLine | null {
    const match = line.match(/^([ \t]*)([-+*]|\d+[.)])\s+(.+)$/);
    if (!match) return null;
    return {
      indent: match[1].replace(/\t/g, '    ').length,
      ordered: /^\d/.test(match[2]),
      content: match[3],
    };
  }

  private parseInline(value: string): MarkdownSegment[] {
    const segments: MarkdownSegment[] = [];
    const emphasisPattern = /(\*\*\*([^*\n]+?)\*\*\*|\*\*([^*\n]+?)\*\*|\*([^*\n]+?)\*)/g;
    let cursor = 0;
    let match: RegExpExecArray | null;

    while ((match = emphasisPattern.exec(value))) {
      if (match.index > cursor) {
        segments.push({ text: value.slice(cursor, match.index), bold: false, italic: false });
      }
      segments.push({
        text: match[2] ?? match[3] ?? match[4],
        bold: Boolean(match[2] || match[3]),
        italic: Boolean(match[2] || match[4]),
      });
      cursor = match.index + match[0].length;
    }

    if (cursor < value.length) {
      segments.push({ text: value.slice(cursor), bold: false, italic: false });
    }
    return segments.length ? segments : [{ text: value, bold: false, italic: false }];
  }
}
