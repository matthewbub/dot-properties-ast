import { promises } from "node:fs";
const { readFile } = promises;

type NodeType = "PropertiesFile" | "Comment" | "Property";

interface ASTNode {
  type: NodeType;
  value?: string[] | string;
  key?: string;
  index?: number;
  children?: ASTNode[];
  debug?: string;
}

interface ASTRoot {
  type: NodeType;
  body: ASTNode[];
}

const ast: ASTRoot = {
  type: "PropertiesFile",
  body: [],
};
let activeKey: string = "";
const testFile = await readFile("./test.properties", { encoding: "utf-8" });
const lines = testFile.split("\n");

// loop through each line
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  const slash = line[line.length - 1] === "\\";

  if (line[0] === "#") {
    activeKey = "";
    ast.body.push({ type: "Comment", value: line, index: i, debug: "Comment" });
  } else if (line === "") {
    activeKey = "";
  } else {
    // secondary line that won't contine
    if (activeKey && !slash) {
      const node = ast.body.find((node) => node?.key === activeKey);
      if (typeof node?.value !== "string" && node?.value) {
        node?.value.push(line);
      }

      activeKey = "";
    }

    if (slash) {
      // first line of a multi liner
      if (!activeKey) {
        const key = line.substring(0, line.indexOf("="));
        const value = [line.substring(line.indexOf("=") + 1, line.length - 1)];

        // set active key
        activeKey = key;

        ast.body.push({
          type: "Property",
          key: key,
          value: value,
          index: i,
          debug: `first line of a multi liner`,
        });
      }

      // secondary line of a multi liner that wiill continue
      else {
        const node = ast.body.find((node) => node?.key === activeKey);
        if (typeof node?.value !== "string" && node?.value) {
          node?.value.push(line);
        }
      }
    }

    // regular key / value
    if (!slash && line.substring(0, line.indexOf("=")) !== "") {
      const key = line.substring(0, line.indexOf("="));
      const value = line.substring(line.indexOf("=") + 1, line.length);

      ast.body.push({
        type: "Property",
        key: key,
        value: value,
        index: i,
        debug: `regular key / value`,
      });
    }
  }
}

console.log(ast);

// ▄▀▀▀█▀▀▄  ▄▀▀█▄▄▄▄  ▄▀▀▀▀▄  ▄▀▀▀█▀▀▄  ▄▀▀▀▀▄
//█    █  ▐ ▐  ▄▀   ▐ █ █   ▐ █    █  ▐ █ █   ▐
//▐   █       █▄▄▄▄▄     ▀▄   ▐   █        ▀▄
//   █        █    ▌  ▀▄   █     █      ▀▄   █
// ▄▀        ▄▀▄▄▄▄    █▀▀▀    ▄▀        █▀▀▀
//█          █    ▐    ▐      █          ▐
//▐          ▐                ▐

// const fails: string[] = [];

// if (!ast.body) {
//   console.log("[FAIL] ast.body is undefined");
// }

// const obj: { [key: string]: ASTNode } = ast.body.reduce((col, curr) => {
//   if (!curr?.index) {
//     return { ...col };
//   }
//   return {
//     ...col,
//     [curr?.index + "_test"]: curr,
//   };
// }, {});

// //console.log(ast.body.find((item) => item?.index === 109))
// // console.log(obj);
// if (obj["0_test"].type !== "Comment") {
//   fails.push("0_test");
// }

// if (obj["1_test"].type !== "Comment") {
//   fails.push("1_test");
// }

// if (obj["4_test"].type !== "Property") {
//   fails.push("4_test");
// }

// console.log("fails", fails.length);
