import React, { useState } from "react";
import { ChevronDown, ChevronRight, File, Hash, Key } from "lucide-react";

interface ASTNode {
  type: "PropertiesFile" | "Comment" | "Property";
  value?: string[] | string;
  key?: string;
  index?: number;
  debug?: string;
  body?: ASTNode[];
}

interface FileData {
  name: string;
  ast: ASTNode;
}

interface PropertiesComparisonProps {
  files: FileData[];
}

const PropertiesComparison: React.FC<PropertiesComparisonProps> = ({
  files,
}) => {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(
    new Set([files[0].name])
  );

  const toggleFileExpand = (fileName: string) => {
    setExpandedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileName)) {
        newSet.delete(fileName);
      } else {
        newSet.add(fileName);
      }
      return newSet;
    });
  };

  const countPropertyReferences = (baseProperties: Set<string>) => {
    const referenceCounts: Record<string, number> = {};
    baseProperties.forEach((prop) => {
      referenceCounts[prop] = 0;
    });

    files.slice(1).forEach((file) => {
      file.ast.body?.forEach((node) => {
        if (node.type === "Property" && baseProperties.has(node.key!)) {
          referenceCounts[node.key!]++;
        }
      });
    });

    return referenceCounts;
  };

  const baseProperties = new Set(
    files[0].ast.body
      ?.filter((node) => node.type === "Property")
      .map((node) => node.key!) || []
  );

  const referenceCounts = countPropertyReferences(baseProperties);

  return (
    <div className="p-4 bg-gray-100 text-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Properties Comparison</h1>
      <div className="space-y-4">
        {files.map((file, index) => (
          <div
            key={file.name}
            className="border rounded-lg bg-white shadow mb-4"
          >
            <div
              className="p-4 cursor-pointer flex items-center"
              onClick={() => toggleFileExpand(file.name)}
            >
              <File className="mr-2 h-5 w-5" />
              <span className="font-medium">{file.name}</span>
              {index === 0 && (
                <span className="ml-2 text-sm text-gray-500">(Base)</span>
              )}
              <ChevronDown
                className={`ml-auto h-5 w-5 transform transition-transform ${
                  expandedFiles.has(file.name) ? "rotate-180" : ""
                }`}
              />
            </div>
            {expandedFiles.has(file.name) && (
              <div className="border-t p-4">
                <NodeRenderer
                  node={file.ast}
                  isBase={index === 0}
                  referenceCounts={referenceCounts}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const NodeRenderer: React.FC<{
  node: ASTNode;
  depth?: number;
  isBase?: boolean;
  referenceCounts?: Record<string, number>;
}> = ({ node, depth = 0, isBase = false, referenceCounts = {} }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const renderValue = (value: string | string[]) => {
    if (typeof value === "string") {
      return <span className="text-green-600 break-all">{`"${value}"`}</span>;
    }
    return (
      <span className="text-green-600">
        [
        <div className="pl-4">
          {value.map((v, i) => (
            <div key={i} className="break-all">
              "{v}"{i < value.length - 1 && ","}
            </div>
          ))}
        </div>
        ]
      </span>
    );
  };

  const renderNodeContent = () => {
    switch (node.type) {
      case "PropertiesFile":
        return (
          <span className="flex items-center font-medium">
            <File className="mr-2 h-3 w-3 flex-shrink-0" />
            Properties File
          </span>
        );
      case "Comment":
        return (
          <span className="flex items-start text-gray-500">
            <Hash className="mr-2 h-3 w-3 flex-shrink-0 mt-0.5" />
            <span className="break-all">{(node.value as string).slice(1)}</span>
          </span>
        );
      case "Property":
        return (
          <span className="flex items-start">
            <Key className="mr-2 h-3 w-3 flex-shrink-0 mt-0.5" />
            <span>
              <span className="text-blue-600 break-all">{node.key}</span>:{" "}
              {renderValue(node.value!)}
              {isBase && (
                <span className="ml-2 text-sm text-gray-500">
                  (Referenced: {referenceCounts[node.key!] || 0})
                </span>
              )}
            </span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-start py-1">
        <div className="flex-shrink-0 w-3 mr-1">
          {node.body && node.body.length > 0 && (
            <button onClick={toggleExpand} className="focus:outline-none">
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          )}
        </div>
        <div className="flex-grow">{renderNodeContent()}</div>
      </div>
      {isExpanded && node.body && (
        <div className="border-l border-gray-200 ml-1.5 pl-4">
          {node.body.map((childNode, index) => (
            <React.Fragment key={index}>
              <NodeRenderer
                node={childNode}
                depth={depth + 1}
                isBase={isBase}
                referenceCounts={referenceCounts}
              />
              {index < node.body!.length - 1 && (
                <hr className="border-t border-gray-100 my-1" />
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  // Sample data with multiple files
  const sampleFiles: FileData[] = [
    {
      name: "base.properties",
      ast: {
        type: "PropertiesFile",
        body: [
          {
            type: "Comment",
            value: "# This is the base file",
            debug: "COMMENT",
          },
          {
            type: "Property",
            key: "greeting",
            value: "Hello, World!",
            index: 1,
            debug: "REGULAR",
          },
          {
            type: "Property",
            key: "farewell",
            value: "Goodbye!",
            index: 2,
            debug: "REGULAR",
          },
        ],
      },
    },
    {
      name: "en_US.properties",
      ast: {
        type: "PropertiesFile",
        body: [
          {
            type: "Comment",
            value: "# US English overrides",
            debug: "COMMENT",
          },
          {
            type: "Property",
            key: "greeting",
            value: "Hello, y'all!",
            index: 1,
            debug: "REGULAR",
          },
        ],
      },
    },
    {
      name: "fr_FR.properties",
      ast: {
        type: "PropertiesFile",
        body: [
          {
            type: "Comment",
            value: "# French overrides",
            debug: "COMMENT",
          },
          {
            type: "Property",
            key: "greeting",
            value: "Bonjour!",
            index: 1,
            debug: "REGULAR",
          },
          {
            type: "Property",
            key: "farewell",
            value: "Au revoir!",
            index: 2,
            debug: "REGULAR",
          },
        ],
      },
    },
  ];

  return <PropertiesComparison files={sampleFiles} />;
}
