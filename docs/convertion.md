# Convertion to Custom Classes

We have often met the situation where the content we load from a JSON
or YAML file must be converted into custom classes. Quick-check let us
define convertion rules that it automatically applies on the object it
found, provided they adhere to the defined schema.

For instane, let us assume the following schema:

```typescript
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

We can define two production rules to convert the object we load from
JSON or YAML into custom classes, as follows:

```typescript
schema.on("person").apply((data) => {
   return new Person(data.firstname,
                     data.lastname)
});

schema.on("team").apply((data) => {
   return new Team(data.name,
                   data.members)
});

const data = ...;
const team = schema.read(data).as("team");
```

Now parsing the data will return an a Team object, whose members are
in turn Person or Team objects. Checkout the complete [Team
example](./team.md) where we illustrate both type-checking and
convertion rules.
