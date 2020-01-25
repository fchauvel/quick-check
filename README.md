# Quick-check

[![Build Status](https://travis-ci.org/fchauvel/quick-check.svg?branch=master)](https://travis-ci.org/fchauvel/quick-check)

Quick-check is small Javascript library to express JSON schema
directly in the code, parse and convert objects into custom classes.

Consider for example the following declaration of a 'schema':

```typescript
import { Grammar } from "@fchauvel/quick-check";
import { anArrayOf,
         anObject,
         aProperty,
         aString,
         eitherOf }  from "@fchauvel/quick-check";

const schema = new Grammar();
schema.define("team")
    .as(anObject()
        .with(aProperty("name").ofType("string"))
        .with(aProperty("members")
              .ofType(anArrayOf(eitherOf("person", "team")))));

schema.define("person")
    .as(anObject()
        .with(aProperty("firstname").ofType("string"))
        .with(aProperty("lastname").ofType("string"))
        .with(aProperty("leads")
              .ofType(anArrayOf("task-reference")))
        .with(aProperty("contributes")
              .ofType(anArrayOf("task-reference"))));

schema.define("task-reference")
    .as(aString()
        .thatMatches(/(T|WP)\s*(\d+)(\.(\d+))*/g));

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
    schema.read(data).as("team");

} catch (report) {
    for (const anyIssue of report.issues) {
        console.log(anyIssue.level);
        console.log(anyIssue.code);
        console.log(anyIssue.location);
        console.log(anyIssue.description);
    }
}


```
