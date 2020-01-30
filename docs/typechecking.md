# Type-checking

You can use quick-check to typecheck JSON object trees, that is to
check that every object you get is as you expect. It is often useful
to provide the user with meaningful error messages.

For instance, we could define a simple JSON schema as follows:

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
