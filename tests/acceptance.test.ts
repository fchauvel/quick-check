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
import { anArrayOf, anObject, aProperty, eitherOf, } from "../src/dsl";
import { Grammar } from "../src/grammar";
import { ErrorCode } from "../src/issues";
import { Person, Team, sampleTeam } from "./team";




describe("Given the Team grammar",  () => {

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
