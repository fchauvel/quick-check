# Quick-check

[![NPM Version](https://img.shields.io/npm/v/@fchauvel/quick-check)](https://www.npmjs.com/package/@fchauvel/quick-check)
[![NPM Monthly download rate](https://img.shields.io/npm/dm/@fchauvel/quick-check)](https://www.npmjs.com/package/@fchauvel/quick-check)
[![Build Status](https://travis-ci.org/fchauvel/quick-check.svg?branch=master)](https://travis-ci.org/fchauvel/quick-check)
[![Test Coverage](https://img.shields.io/codecov/c/github/fchauvel/quick-check)](https://codecov.io/gh/fchauvel/quick-check/)
[![Code Grade](https://img.shields.io/codacy/grade/bba21bb40e6c48bc87e1b8c0517dc2fa.svg)](https://app.codacy.com/manual/fchauvel/quick/dashboard)

Quick-check is small Javascript library to [declare
schema](./declaration.md) directly in the code, [validate
data](./typechecking.md) and [convert](./convertion.md) objects into
custom classes.

## Schema Declaration

Quick-check let us declare data schema  in a readable manner that reduces the need for documentation.
```typescript
const schema = new Grammar();
schema.define("team")
    .as(anObject()
        .with(aProperty("name").ofType("string"))
        .with(aProperty("members")
              .ofType(anArrayOf(eitherOf("person", "team")))));
schema.define("person")
    .as(anObject()
        .with(aProperty("firstname")
              .ofType("string")
              .withDefault("Unknown"))
        .with(aProperty("lastname").ofType("string")));
```

## Data Validation

We can now check whether the data we get from JSON or YAML file adhere
to our schema.

```typescript
const fileContent = fs.readFileSync('./data.yaml', 'utf8');
const data = yaml.safeLoad(fileContents);

try {
    const myTeam = schema.read(data).as("team");

} catch (report) {
    console.log(report.toString());
}
```

## Convertions

We can also equip our type definitions with convertion rules to obtain
objects instance of specific home-grown classes.

```typescript

schema.on("team").apply((data) => {
    return new Team(data.name, data.members);
});

schema.on("person").apply((data) => {
    return new Person(data.firstname, data.lastname);
});

const myTeam = schema.read(data).as("team");
console.log(myTeam.members[1].members[0].name);

```
