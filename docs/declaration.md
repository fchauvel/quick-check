# Declaring your Data Schema

Let us assume we need to parse data describing people organized as
teams. A team includes persons or smaller teams. By constrast, a
person includes its lastname, and possibly its firstname.

```typescript {highlight: [8, '9-14', '16-20']}
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

You are now ready to [validate](./typechecking.md) and [convert](./convertion.md) data!
