# Quick-check

[![Build Status](https://travis-ci.org/fchauvel/quick-check.svg?branch=master)](https://travis-ci.org/fchauvel/quick-check)

Quick-check is small Javascript library to express JSON schema
directly in the code, parse and convert objects into custom classes.

Consider for example the following declaration of a 'schema':

```typescript
const grammar = new Grammar();
grammar.define("person")
   .as(anObject()
       .with(aProperty("firstname").as("string"))
       .with(aProperty("lastname").as("string")));
grammar.define("team")
    .as(anObject()
        .with(aProperty("name").as("string"))
        .with(aProperty("members")
            .as(anArrayOf(eitherOf("person", "team")))));
```

## Type-checking

Provide we defined a grammar as above, we now check an existing
structure as follows:

```typescript
const data = {
   name: "Team",
   members: [
     {
        firstname: "John",
        lastname: "Doe"
     },
     {
        name: "Sub team",
        members: [
          {
             firstname: "James",
             lastname: "Bond"
          }
        ]
     }
   ]
}

try {
    grammar.read(data).as("team");

} catch (report) {
    for (const anyIssue of report.issues) {
        console.log(anyIssue.level);
        console.log(anyIssue.code);
        console.log(anyIssue.location);
        console.log(anyIssue.description);
    }
}


```
