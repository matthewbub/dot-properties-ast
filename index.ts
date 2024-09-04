import { promises } from "node:fs";
const { readFile } = promises;

type NodeType = "PropertiesFile" | "Comment" | "Property";

interface ASTNode {
  type: NodeType;
  value?: string[] | string;
  key?: string;
  index?: number;
  debug?: string;
}

interface ASTRoot {
  type: NodeType;
  body: ASTNode[];
}

const debug = {
  multiline: "MULTILINE",
  regular: "REGULAR",
  comment: "COMMENT",
};

class ASTRoot {
  type: NodeType;
  body: ASTNode[];

  constructor(type: NodeType) {
    this.type = type;
    this.body = [];
  }
}

class ASTNode {
  type: NodeType;
  value?: string[] | string;
  key?: string;
  index?: number;
  debug?: string;

  constructor(
    type: NodeType,
    value?: string[] | string,
    key?: string,
    index?: number,
    debug?: string
  ) {
    this.type = type;
    this.value = value;
    this.key = key;
    this.index = index;
    this.debug = debug;
  }
}

interface Options {
  debug?: boolean;
  comments?: boolean;
}

class ASTParser {
  activeKey: string = "";
  lines: string[] = [];
  options: Options = {
    debug: false,
    comments: false,
  };
  ast = new ASTRoot("PropertiesFile");

  constructor(options?: Options) {
    this.options = {
      debug: options?.debug || false,
      comments: options?.comments || false,
    };
  }

  init(lines: string[]) {
    this.lines = lines;
  }

  handleComment(line: string) {
    if (this.options.comments) {
      this.activeKey = "";
      this.ast.body.push(
        new ASTNode(
          "Comment",
          line,
          undefined,
          undefined,
          this.options.debug ? debug.comment : undefined
        )
      );
    }
  }

  handleBlankLine() {
    // do nada
    this.activeKey = "";
  }

  handleProperty(line: string, index: number) {
    const slash = line[line.length - 1] === "\\";

    // secondary line that won't continue
    if (this.activeKey && !slash) {
      const node = this.ast.body.find((node) => node?.key === this.activeKey);
      if (typeof node?.value !== "string" && node?.value) {
        node?.value.push(line);
      }

      this.activeKey = "";
    }

    if (slash) {
      // first line of a multi liner
      if (!this.activeKey) {
        const key = line.substring(0, line.indexOf("="));
        const value = [line.substring(line.indexOf("=") + 1, line.length - 1)];

        // set active key
        this.activeKey = key;

        this.ast.body.push(
          new ASTNode(
            "Property",
            value,
            key,
            index,
            this.options?.debug ? debug.multiline : undefined
          )
        );
      }

      // secondary line of a multi liner that will continue
      else {
        const node = this.ast.body.find((node) => node?.key === this.activeKey);
        if (typeof node?.value !== "string" && node?.value) {
          node?.value.push(line);
        }
      }
    }

    // regular key / value
    if (!slash && line.substring(0, line.indexOf("=")) !== "") {
      const key = line.substring(0, line.indexOf("="));
      const value = line.substring(line.indexOf("=") + 1, line.length);

      this.ast.body.push(
        new ASTNode(
          "Property",
          value,
          key,
          index,
          this.options.debug ? debug.regular : undefined
        )
      );
    }
  }
  parse() {
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i].trim();

      if (line[0] === "#") {
        this.handleComment(line);
      } else if (line === "") {
        this.handleBlankLine();
      } else {
        this.handleProperty(line, i);
      }
    }
    return this.ast;
  }
}

const testFile = await readFile("./test.properties", { encoding: "utf-8" });
const lines = testFile.split("\n");

const parser = new ASTParser({
  debug: true,
  comments: true,
});

parser.init(lines);
console.log(parser.parse());
