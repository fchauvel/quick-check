# Validation

You can use quick-check to validate object trees against a shema, that
is to check that every object you get is as you expect. It is often
useful to provide the user with meaningful error messages.

For instance, provided you've defined our [team
schema](./declaration.md), we can now validate as follows. Note that
we can set what data we expect but using the `as`function.

```typescript {highlight: [4]}
const fileContent = fs.readFileSync('./data.json', 'utf8');
const data = JSON.parse(fileContents);
try {
    const myTeam = schema.read(data).as("team");

} catch (report) {
    console.log(report.toString());

}
```

For the sake of example, let us assume that the JSON file we loaded
does not adhere exactly to our [schema](./declaration.md). For
instance, that the first member has an extra attribute, as follows:

```json {highlight: [6]}
{
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
             lastname: "Bond"
          }
        ]
     }
   ]
}
```

The extra fields `points` that we added on the John Doe record, is
detected and report as follows:

```shell-session
$ node example.js
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
