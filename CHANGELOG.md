# Version History

## [Unreleased][unreleased]

## [Quick-check v0.2.0][v0.2.0]

-   [Online documentation][doc]

-   New constraints, including:

    -   Integers
        -   even
        -   odd
        -   multipleOf(base: number)
        -   powerOf(base: number)

    -   Numbers
        -   strictlyAbove(bound: number)
        -   aboveOrEqualTo(bound: number)
        -   strictlyBelow(bound: number)
        -   belowOrEqualTo(bound: number)
        -   positive
        -   negative

    -   Strings
        -   nonEmpty
        -   startingWith(prefix: string)
        -   endingWith(suffix: string)
        -   ofLengthAtMost(maximum: number)
        -   OfLengthAtLeast(minimum: number)

    -   Arrays
        -   ofSize(size: number)
        -   ofSizeAtLeast(minimum: number)
        -   ofSizeAtMost(maximum: number)
        -   ofUniqueItems()

## [Quick-Check v0.1.0][v0.1.0]

-   Basic type-checking of Object trees, including:

    -   Boolean values
    -   String values (with regexp)
    -   Numbers
    -   Arrays
    -   Union of types
    -   Objects (with optional properties)

-   The type-checking detects

    -   Typing error (e.g., string expected, but number found)
    -   Missing properties on objects
    -   Extraneous properties on objects

-   Optional production rules associated with strings, booleam value,
    numbers, array and objects.

[doc]: https://fchauvel.github.io/quick-check/index.html

[unreleased]: https://github.com/fchauvel/quick-check/compare/v0.2.0..dev

[v0.2.0]: https://github.com/fchauvel/quick-check/compare/v0.2.0..v0.1.0

[v0.1.0]: https://github.com/fchauvel/quick-check/v0.1.0
