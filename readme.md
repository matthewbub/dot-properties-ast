# Properties AST

An abstract syntax tree generator for those .properties files

## .properties logic

I can't think of much beyond this.

- Keys and values are always seperated by an `=`
- Comments always lead with a `#`
- Values can be single line or multi line
  - multi line values always trail with a `\`

## Setup

I'm using deno, there's no dependieces so you can run whatever just gotta handle the ts however you want srry

```sh
deno run --allow-read=./test.properties index.ts
```

## Example

Given this .properties file

```properties
# This is a comment
greeting = Hello, world!
farewell = Goodbye!
multiline = This is a long value \
            that spans multiple lines.
```

Recieve an AST

```json
{
  "type": "PropertiesFile",
  "body": [
    {
      "type": "Comment",
      "value": "This is a comment"
    },
    {
      "type": "Property",
      "key": "greeting",
      "value": "Hello, world!"
    },
    {
      "type": "Property",
      "key": "farewell",
      "value": "Goodbye!"
    },
    {
      "type": "Property",
      "key": "multiline",
      "value": ["This is a long value ", "that spans multiple lines."]
    }
  ]
}
```
