# Properties AST

An abstract syntax tree generator for those .properties files 


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
      "value": [
        "This is a long value ",
        "that spans multiple lines."
      ]
    }
  ]
}
```
