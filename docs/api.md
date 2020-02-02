# API Documentation

## Schema / Grammar

You can define a schema by create a Grammar object as follow:

```typescript
const mySchema = new Grammar();
```

## Type definition

You can define a new type using the syntax
`mySchema.define("myNewType").as(...)`. The `as` function accepts an
Object type, an Array type, a Union type, or any primitive types.


## Convertion Rules

You can define convertion by using the syntax
`mySchema.on("MyType").apply(myConvertion)`. This specifies that every
instance of tthe type "MyType" will be converted using the function
`myConvertion`. Convertion are function that accept a single arguments
and must return something. For instance, I could define a function to
convert a JSON object with the fields `firstname`and `lastname` into a
proper object using:

```typescript
mySchema.on("person").apply((data) => {
    return new Person(data.firstname,
                      data.lastname);
});
```


## Object Types

-   `anObject()` creates a new type of object. You can specify its fields using:

    -   `anObject.with(aProperty("foo").ofType("string"))` defines a
        new property on previous object types.

The function `aProperty()` let you create property that can be
customized as follows:

-   `aProperty().optional()` defines a property which may not be
    defined on the object

-   `aProperty().withDefault(v: any)` defines an optional property,
    whose default value will be the given default value.


## Array Types

The function `anArrayOf(type: Type)` let you define a new type of
array,  which you can further constrain as follows:

-   `anArrayOf(...).nonEmpty()` to ensure the given array include at
    least one entry.

-   `anArrayOf(...).ofSize(n: number)` to ensure the given array
    contains exactly n elements.

-   `anArrayOf(...).ofSizeAtLeast(n: number)` to ensure the
    given array contains at least n elements.

-   `anArrayOf(...).ofSizeAtMost(n: number)` to ensure the given array
    contains at most n elements.

-  `anArrayOf(...).withUniqueItems()` to ensure that there is no
   "duplicate" (i.e., two items that are `===` equivalent).


## Union Types

The function `eitherOf(type1, type2, ...)` lets you define types as
the union of other types. Note that you can either refer to existing
types by their name, or directly inline a new type definition.

## Primitive Types

### Boolean

-   `aBoolean()` creates a new boolean type.

### Integer

-   `anInteger()` create a new integer type, which you can customize
    using:

    -   `anInteger().even()` ensures the given number is even.

    -   `anInteger().odd()` ensures the given number is odd.

    -   `anInteger().multipleOf(n: number)` ensures the given number
        is a multiple of n.

    -   `anInteger().powerOf(n: number)` ensures the given number is a
        power of n.

    -   All the functions defined for 'numbers' below.

### Number

-   `aNumber()` creates an new number type, which you can customize
    using:

    -   `aNumber().strictlyAbove(bound: number)` to ensure the value
        is strictly above the given bound.

    -   `aNumber().aboveOrEqualTo(bound: number)` to ensure the value
        is above or equal to the given bound.

    -   `aNumber().strictlyBelow(bound: number)` to ensure the value
        is strictly below the given bound.

    -   `aNumber().belowOrEqualTo(bound: number)` to ensure the value
        is below or equal to the given bound.

    -   `aNumber().positive()` to ensure the value is above or equal
        to zero.

    -   `aNumber().strictlyPositive()` to ensure the value is strictly
        above zero.

    -   `aNumber().negative()` to ensure the value is below or equal
        to zero.

    -   `aNumber().strictlyNegative()` to ensure the value is strictly
        below zero.

### String

-   `aString()` creates a new string type, which you can customize
    using:

    -   `aString().nonEmpty()` to  prevent using the empty string "".

    -   `aString().thatMatches(pattern: Regexp)`to ensure the value
        matches the given pattern.

    -   `aString().startingWith(prefix: string)`to ensure the given string
        starts with a specific prefix.

    -   `aString().endingWith(suffix: string)`to ensure the given
        string ends with a specific suffix.

    -   `aString().ofLengthAtLeast(n: number)` to ensure the given
        string is at least n-characters long.

    -   `aString().ofLengthAtMost(n: number)` to ensure the given
        string is at most n-characters long.
