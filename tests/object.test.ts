/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import { Test } from "./commons";
import { anObject, aProperty } from "../src/dsl";
import { ErrorCode } from "../src/issues";


describe("A grammar using an object should", () => {

    const tester = new Test();
    tester.grammar.define("person").as(
        anObject()
            .with(aProperty("firstname")
                  .optional()
                  .ofType("string"))
            .with(aProperty("lastname").ofType("string"))
            .with(aProperty("points")
                  .ofType("number")
                  .withDefault(100))
    );


    test("extract all fields", () => {
        const json = {
            firstname: "John",
            lastname:  "Doe",
            points:  50
        };

        const john = tester.grammar.read(json).as("person");

        expect(john.firstname).toBe("John");
        expect(john.lastname).toBe("Doe");
        expect(john.points).toBe(50);
    });


    test("warn about missing properties",  () =>  {
        const json = { firstname: "John" };
        tester.verifyIssues(json, "person",
                            [ [ ErrorCode.MISSING_PROPERTY, 1  ] ]);

    });


    test("not warn about missing optional properties", () => {
        const json = { lastname:  "Doe" };

        const john = tester.grammar.read(json).as("person");

        expect(john.firstname).toBe(null);
        expect(john.lastname).toBe("Doe");
        expect(john.points).toBe(100);
    });


    test("warn about extraneous properties",  () =>  {
        const json = {
            firstname: "John",
            lastname: "Doe",
            extraProperty: 250
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
