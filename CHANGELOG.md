# Version History

## [Unreleased][unreleased]

-   Constraints on numbers, including:

    -   strictlyBelow(bound) to ensure the value remains strictly below
        the given bound.

    -   belowOrEqualTo(bound) to ensure the value remains below or
        equal to the given bound.

    -   strictlyAbove(bound) to ensure the value remains strictly
        greater than the given bound.

    -   aboveOrEqualTo(bound) to ensure the value remains strictly
        greater or equal to the given bound.

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

[unreleased]: https://github.com/fchauvel/quick-check/compare/v0.1.0..dev

[v0.1.0]: https://github.com/fchauvel/quick-check/compare/v0.1.0..dev
