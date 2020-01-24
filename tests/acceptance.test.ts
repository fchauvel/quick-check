/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import { anArrayOf, anObject, aProperty, eitherOf, } from "../src/dsl";
import { Grammar } from "../src/grammar";
import { ErrorCode } from "../src/issues";
import { Person, Team, sampleTeam } from "./team";


class Test {

    public grammar: Grammar;

    constructor() {
        this.grammar = new Grammar();
    }


    public verifyIssues(
        json: any,
        expectedType: string,
        expectedIssues: [string, number][]): void {

        try {
            this.grammar.read(json).as(expectedType);
            fail("Should have thrown an  error!");

        } catch (issues) {
            const expectedCount = expectedIssues.reduce(
                (sum, [_, count]) => sum + count,
                0);
            expect(issues.length).toBe(expectedCount);
            for (const [code, count] of expectedIssues) {
                expect(issues.withCode(code)).toHaveLength(count);
            }
        }
    }
}



describe("A grammar expecting a string should",  () => {

    const tester = new Test();

    test("Accept a single string", () => {
        const json = "this is  a string";

        const text = tester.grammar.read(json).as("string");

        expect(text).toBe(json);
    });


    test("report a type error when other value are given", () => {
        tester.verifyIssues(true, "number",
                          [ [ ErrorCode.TYPE_ERROR, 1 ]]);
    });

});


describe("A grammar expecting a number should",  () => {

    const tester = new Test();

    test("Accept a single number", () => {
        const json = 123.34;

        const number = tester.grammar.read(json).as("number");

        expect(number).toBe(json);
    });


    test("report a type error when other value are given", () => {
        tester.verifyIssues(true, "string",
                          [ [ ErrorCode.TYPE_ERROR, 1 ] ]);
    });


});


describe("A grammar expecting a boolean should",  () => {

    const tester = new Test();

    test("Accept a single boolean value", () => {
        const json = true;

        const value = tester.grammar.read(json).as("boolean");

        expect(value).toBe(json);
    });


    test("report a type error when other value are given", () => {
        tester.verifyIssues(1234, "boolean",
                          [ [ ErrorCode.TYPE_ERROR, 1 ] ]);
    });


});


describe("A grammar expecting an array should", () => {

    const tester = new Test();
    tester.grammar.define("array-of-number")
        .as(anArrayOf("number"));

    test("Accept arrays of element", () => {
        const json = [1, 2, 3, 4, 5];
        const values = tester.grammar.read(json).as("array-of-number");
        expect(values).toHaveLength(json.length);
        for(const [index, value] of json.entries()) {
            expect(values[index]).toBe(json[index]);
        }
    });


    test("Detect type errors when it does not get an array", () => {
        const json = true;
        tester.verifyIssues(json, "array-of-number",
                            [ [ ErrorCode.TYPE_ERROR, 1 ] ]);
    });


    test("Report type error if the array contains other types", () => {
        const json = [1, 2, true, 3, 4, "bonjour" ];
        tester.verifyIssues(json, "array-of-number",
                            [ [ ErrorCode.TYPE_ERROR, 2 ] ]);
    });


});


describe("A grammar with a union of string and number should", () => {

    const tester = new Test();
    tester.grammar.define("union")
        .as(eitherOf("string", "number"));

    test("accept string values", () => {
        const jsonString = "some string value";
        const value = tester.grammar.read(jsonString).as("union");
        expect(value).toBe(jsonString);
    });

    test("accept number values", () => {
        const jsonNumber = 123.54;
        const value = tester.grammar.read(jsonNumber).as("union");
        expect(value).toBe(jsonNumber);
    });

    test("raise a type error for every other type", () => {
        const jsonBoolean = true;
        tester.verifyIssues(jsonBoolean, "union",
                            [ [ ErrorCode.NO_MATCHING_TYPE, 1 ]]);
    });

});



describe("A grammar using an object should", () => {

    const tester = new Test();
    tester.grammar.define("person").as(
        anObject()
            .with(aProperty("firstname").ofType("string"))
            .with(aProperty("lastname").ofType("string"))
    );


    test("extract all fields", () => {
        const json = {
            firstname: "John",
            lastname:  "Doe"
        };

        const john = tester.grammar.read(json).as("person");

        expect(john.firstname).toBe("John");
        expect(john.lastname).toBe("Doe");
    });


    test("warn about missing properties",  () =>  {
        const json = { firstname: "John" };
        tester.verifyIssues(json, "person",
                            [ [ ErrorCode.MISSING_PROPERTY, 1  ] ]);

    });


    test("warn about extraneous properties",  () =>  {
        const json = {
            firstname: "John",
            lastname: "Doe",
            IQ: 250
        };

        tester.verifyIssues(json, "person",
                            [ [ ErrorCode.IGNORED_PROPERTY, 1  ] ]);
    });


    test("raise a type error on other types",  () =>  {
        const json = "this is not an object";

        tester.verifyIssues(json, "person",
                            [ [ ErrorCode.TYPE_ERROR, 1  ] ]);
    });


});


describe("A grammar with production rules should on object",  () => {

    const tester = new Test();
    tester.grammar.define("person")
        .as(anObject()
            .with(aProperty("firstname").ofType("string"))
            .with(aProperty("lastname").ofType("string")));
    tester.grammar.define("team")
        .as(anObject()
            .with(aProperty("name").ofType("string"))
            .with(aProperty("members")
                  .ofType(anArrayOf(eitherOf("person", "team")))));

    tester.grammar
        .on("person")
        .apply(data => new Person(data.firstname, data.lastname));
    tester.grammar
        .on("team")
        .apply(data => new Team(data.name, data.members));


    test("extract the members of a team as persons", () => {
        const team = tester.grammar.read(sampleTeam()).as("team");

        expect(team.members).toHaveLength(2);
        expect(team.members[0].name).toBe("Doe, John");
        expect(team.members[1].name).toBe("Bond, James");
    });

});


describe("A grammar with a production rule",  () => {


    test("modify strings accordingly",  () => {

        const tester = new Test();
        tester.grammar
            .on("string")
            .apply(s => s.toUpperCase());


        const text = "Bonjour";

        const output = tester.grammar.read(text).as("string");

        expect(output).toBe(text.toUpperCase());

    });


    test("modify the number accordingly",  () => {
        const tester = new Test();
        tester.grammar
            .on("number")
            .apply(n => n + 1);


        const text = 125;
        const output = tester.grammar.read(text).as("number");
        expect(output).toBe(126);
    });


    test("modify booleans accordingly",  () => {
        const tester = new Test();
        tester.grammar
            .on("boolean")
            .apply(b => !b);


        const input = true;
        const output = tester.grammar.read(input).as("boolean");
        expect(output).toBe(false);
    });


    test("modify arrays accordingly",  () => {
        const tester = new Test();
        tester.grammar.define("list-of-number")
            .as(anArrayOf("number"));
        tester.grammar
            .on("list-of-number")
            .apply(a => a.reverse());

        const input = [1, 2, 3];
        const output = tester.grammar.read(input).as("list-of-number");
        expect(output).toStrictEqual([3, 2, 1]);
    });

});
