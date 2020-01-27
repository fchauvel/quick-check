# Quick-check

[![Build Status](https://travis-ci.org/fchauvel/quick-check.svg?branch=master)](https://travis-ci.org/fchauvel/quick-check)
[![Code Grade](https://img.shields.io/codacy/grade/bba21bb40e6c48bc87e1b8c0517dc2fa.svg)](https://app.codacy.com/manual/fchauvel/quick/dashboard)


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
schema.define("person")
    .as(anObject()
        .with(aProperty("firstname")
              .ofType("string")
              .withDefault("Unknown"))
        .with(aProperty("lastname").ofType("string")));

schema.define("team")
    .as(anObject()
        .with(aProperty("name").ofType("string"))
        .with(aProperty("members")
              .ofType(anArrayOf(eitherOf("person", "team")))));
```

## Type-checking

Provided we defined the schema/grammar as above, we now type-check an
existing structure as follows:

```typescript
const data = {
   name: "Team",
   members: [
     {
        lastname: "Doe",
        points: 123 // We add an extraneous fields
     },
     {
        name: "Sub team",
        members: [
          {
             firstname: "James",
             lastname: "Bond",
  }
        ]
     }
   ]
}

try {
    const myTeam = schema.read(data).as("team");

} catch (report) {
    console.log(report.toString());
}


```

The extra fields `points` that we added on the John Doe record, is
detected and report as follows:

```console
  1. Error: 'NO MATCHING TYPE' at root/members/#0
     None of the possible type matches (person, team)
      - Assuming value is of type 'person':
        1. Warning: 'IGNORED PROPERTY' at root/members/#0
           Ignored property 'points' (with value '123').

      - Assuming value is of type 'team':
        1. Error: 'MISSING PROPERTY' at root/members/#0
           Missing property 'name' of type 'string'.

        2. Error: 'MISSING PROPERTY' at root/members/#0
           Missing property 'members' of type 'array(eitherOf(person, team))'.

        3. Warning: 'IGNORED PROPERTY' at root/members/#0
           Ignored property 'lastname' (with value 'Doe').

        4. Warning: 'IGNORED PROPERTY' at root/members/#0
           Ignored property 'points' (with value '123').

```

## Convertion Rules

I often meet the situation where I not only want to type-check a given
object structure, but I also want to convert object to specific
home-grown clases.

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

Provided the classes `Team`and `Person` we refer to expose a
`name`property, this example could yield for instance:

```console
Bond, James
```

Here we assume that we have defined specific classes to capture teams and
persons, for instance, we could have defined them as follows:

```typescript
abstract class Partner {
    public abstract get name(): string;
}

class Person extends Partner {
    private _firstname: string;
    private _lastname: string;

    constructor (firstname: string, lastname: string) {
        super();
        this._firstname = firstname;
        this._lastname: lastname;
    }

    public get name(): string {
        return `${this._lastname}, ${this._firstname}`;
    }
}

class Team extends Partner {
    private _name: string;
    private _members: Partner[];

    constructor(name: string, members: Partner[]) {
        super();
        this._name = name;
        this._members = members;
    }

    public get name(): string { return this._name }

}

```
