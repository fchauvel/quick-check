/*
 * Copyright (C) 2019, 2020 Franck Chauvel
 * All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.
 *
 * See the LICENSE file for details.
 */


import * as ast from "./ast";


interface Builder<T> {
    build(): T;
}


abstract class TypeBuilder<T extends ast.Type> implements Builder<T> {

    public _constraints: ast.Constraint<any>[];
    public converter: ast.Converter;

    constructor() {
        this._constraints = [];
        this.converter = (data: any): any => { return data; };
    }

    public abstract build(): T;

    protected check<T>(check: (n:T) => boolean,
                  description: string): this {
        this._constraints.push(new ast.Constraint<T>(description, check));
        return this;
    }


}


type TypeRef<T extends ast.Type> = string | TypeBuilder<T>;



class ReferenceBuilder extends TypeBuilder<ast.Reference> {

    private _target: string;

    constructor(target: string) {
        super();
        this._target = target;
    }

    public build(): ast.Reference {
        return new ast.Reference(this._target);
    }

}


class ObjectBuilder extends TypeBuilder<ast.ObjectType> {

    private _properties: PropertyBuilder[];

    constructor() {
        super();
        this._properties = [];
    }

    public with(property: PropertyBuilder): ObjectBuilder {
        this._properties.push(property);
        return this;
    }

    public build(): ast.ObjectType {
        const properties: ast.Property[] = [];
        for (const eachProperty of this._properties) {
            properties.push(eachProperty.build());
        }
        return new ast.ObjectType(properties, this.converter);
    }

}

export function anObject(): ObjectBuilder {
    return new ObjectBuilder();
}


class StringBuilder extends TypeBuilder<ast.StringType> {

    public thatMatches(pattern: RegExp): StringBuilder {
        return this.check<string>(
            s => pattern.test(s),
            `Value must match the pattern '${pattern}'`
        );
    }

    public nonEmpty(): StringBuilder {
        return this.check<string>(
            s => s !== "",
            "Shall not be an empty string"
        );
    }

    public startingWith(prefix: string): StringBuilder {
        return this.check<string>(
            s => s.startsWith(prefix),
            `Shall start with '${prefix}'`
        );
     }

    public endingWith(suffix: string): StringBuilder {
        return this.check<string>(
            s => s.endsWith(suffix),
            `Shall end with '${suffix}'`
        );
    }

    public build(): ast.StringType {
        return new ast.StringType(this._constraints, this.converter);
    }

}

export function aString(): StringBuilder {
    return new StringBuilder();
}



class PropertyBuilder implements Builder<ast.Property> {

    private _name: string;
    private _type: TypeBuilder<any>;
    private _isOptional: boolean;
    private _defaultValue: any;

    constructor(name: string) {
        this._name = name;
        this._type = new StringBuilder();
        this._isOptional = false;
        this._defaultValue = null;
    }

    public optional(defaultValue: any = null): PropertyBuilder {
        this._isOptional = true;
        this._defaultValue = defaultValue;
        return this;
    }

    public withDefault(defaultValue: any): PropertyBuilder {
        return this.optional(defaultValue);
    }

    public mandatory(): PropertyBuilder {
        this._isOptional = false;
        return this;
    }

    public ofType(type: TypeRef<any>): PropertyBuilder {
        if (typeof type === "string") {
            this._type = new ReferenceBuilder(type);
        } else {
            this._type = type;
        }
        return this;
    }

    public build(): ast.Property {
        return new ast.Property(
            this._name,
            this._isOptional,
            this._defaultValue,
            this._type.build());
    }
}


export function aProperty(name: string): PropertyBuilder {
    return new PropertyBuilder(name);
}



class ArrayBuilder extends TypeBuilder<ast.ArrayType> {

    private _contentType: TypeBuilder<any>;

    constructor(contentType: TypeBuilder<any>) {
        super();
        this._contentType = contentType;
    }

    public ofSize(count: number): ArrayBuilder {
        return this.check<Array<any>>(
            a => a.length === count,
            `Must have exactly ${count} entries (found {a.length})`);
    }

    public ofSizeAtLeast(minimum: number): ArrayBuilder {
        return this.check<Array<any>>(
            a => a.length >= minimum,
            `Must have at least ${minimum} entries`
        );
    }

    public ofSizeAtMost(maximum: number): ArrayBuilder {
        return this.check<Array<any>>(
            a => a.length <= maximum,
            `Must have at most ${maximum} entries`
        );
    }

    public withUniqueItems(): ArrayBuilder {
        return this.check<Array<any>>(
            a => {
                for (const [i1, e1] of a.entries()) {
                    for (const [i2, e2] of a.entries()) {
                        if (i1 !== i2 && e1 === e2) {
                            return false;
                        }
                    }
                }
                return true;
            },
            "Item must be unique!"
        );
    }

    public build(): ast.ArrayType {
        return new ast.ArrayType(
            this._contentType.build(),
            this._constraints,
            this.converter);
    }

}


export function anArrayOf<T extends ast.Type>
    (entryType: TypeRef<T>): ArrayBuilder {
    if (typeof entryType === "string") {
        return new ArrayBuilder(new ReferenceBuilder(entryType as string));
    }
    return new ArrayBuilder(entryType as TypeBuilder<T>);
}



class UnionBuilder extends TypeBuilder<ast.Union> {

    private _candidateBuilders: TypeBuilder<any>[];

    constructor(candidateBuilders: TypeBuilder<any>[]) {
        super();
        this._candidateBuilders = candidateBuilders;
    }

    public build(): ast.Union {
        const candidatesTypes: ast.Type[] = [];
        for (const eachBuilder of this._candidateBuilders) {
            candidatesTypes.push(eachBuilder.build());
        }
        return new ast.Union(candidatesTypes);
    }
}


export function eitherOf(...candidates: TypeRef<any>[]): UnionBuilder {
    const builders: TypeBuilder<any>[] = [];

    for (const anyCandidate of candidates) {
        if (typeof anyCandidate === "string") {
            builders.push(new ReferenceBuilder(anyCandidate as string));
        } else {
            builders.push(anyCandidate);
        }
    }
    return new UnionBuilder(builders);
}





class NumberBuilder extends TypeBuilder<ast.Number> {

    public strictlyAbove(bound: number): NumberBuilder {
        return this.check<number>(
            v => v > bound,
            `Value should be strictly above ${bound}`);
    }

    public aboveOrEqualTo(bound: number): NumberBuilder {
        return this.check<number>(
            v => v >= bound,
            `Value should be above or equal to ${bound}`);
    }

    public strictlyBelow(bound: number): NumberBuilder {
        return this.check<number>(
            v => v < bound,
            `Value should be strictly below ${bound}`);
    }

    public belowOrEqualTo(bound: number): NumberBuilder {
        return this.check<number>(
            v => v <= bound,
            `Value should be below or equal to ${bound}` );
    }

    public positive(): NumberBuilder {
        return this.aboveOrEqualTo(0);
    }

    public strictlyPositive(): NumberBuilder {
        return this.strictlyAbove(0);
    }

    public negative(): NumberBuilder {
        return this.belowOrEqualTo(0);
    }

    public strictlyNegative(): NumberBuilder {
        return this.strictlyBelow(0);
    }


    public build(): ast.Number {
        return new ast.Number(
            this._constraints,
            this.converter);
    }

}

export function aNumber(): NumberBuilder {
    return new NumberBuilder();
}



class BooleanBuilder extends TypeBuilder<ast.Boolean> {

    public build(): ast.Boolean {
        return new ast.Boolean(this.converter);
    }

}


export function aBoolean(): BooleanBuilder {
    return new BooleanBuilder();
}

export class TypeDeclaration {

    private _name: string;
    private _builder: TypeBuilder<any>;
    private _type: { isBuilt: boolean; result: ast.Type};
    private _converter: ast.Converter

    constructor(name: string) {
        this._name = name;
        this._builder = new StringBuilder();
        this._type = {
            isBuilt:  false,
            result: aString().build()
        };
        this._converter = (o):  any => o;
    }

    public isNamed(name: string): boolean {
        return this._name === name;
    }

    public get type(): ast.Type {
        if (!this._type.isBuilt) {
            this._type.result = this._builder.build();
            this._type.isBuilt = true;
        }
        return this._type.result;
    }

    public as(type: TypeBuilder<any>): TypeDeclaration {
        this._builder = type;
        return this;
    }


    public apply(converter: ast.Converter): any {
        this._builder.converter = converter;
    }

    public convert(data: any): any {
        return this._converter(data);
    }

}
