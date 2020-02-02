# Convertion to Custom Classes

We have often met the situation where the content we load from a JSON
or YAML file must be converted into custom classes. Quick-check let us
define convertion rules that it automatically applies on the objects it
found, provided they adhere to the defined schema.

Provided we have defined our [team schema](./declaration.md), we can
define two production rules to convert the object we load from JSON or
YAML into custom classes, as follows:

```typescript
schema.on("person").apply(
    (data) => {
        return new Person(data.firstname,
                          data.lastname)
    }
);

schema.on("team").apply(
   (data) => {
       return new Team(data.name,
                       data.members)
   }
);
```

The `read(...).as("team")` statement now returns a "Team" object.

```typescript {highlight: \[4]}
const fileContent = fs.readFileSync('./data.json', 'utf8');
const data = JSON.parse(fileContents);
try {
    const myTeam = schema.read(data).as("team");

} catch (report) {
    console.log(report.toString());

}
```

Now parsing the data will return an a Team object, whose members are
in turn Person or Team objects. Checkout the complete [Team
example](./team.md) where we illustrate both validation and
convertion.
