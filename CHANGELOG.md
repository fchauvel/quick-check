# Version History

## [Unreleased][unreleased]

*   Basic type-checking of Object trees, including:

    * Boolean values
    * String values (with regexp)
    * Numbers
    * Arrays
    * Union of types
    * Objects (with optional properties)

*   The type-checking detects

    *   Typing error (e.g., string expected, but number found)
    *   Missing properties on objects
    *   Extraneous properties on objects

*   Optional production rules associated with strings, booleam value,
    numbers, array and objects.


[unreleased]: https://github.com/fchauvel/quick-check/compare/master..dev
