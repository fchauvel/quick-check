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
    build (): T;
}


interface TypeBuilder<T extends ast.Type> extends Builder<T> {}


type TypeRef<T extends ast.Type> = string | TypeBuilder<T>;



class ReferenceBuilder implements TypeBuilder<ast.Reference> {

    private _target: string;

    constructor(target: string) {
        this._target = target;
    }

    public build(): ast.Reference {
        return new ast.Reference(this._target);
    }

}


export function anObject(): ObjectBuilder {
    return new ObjectBuilder();
}



class ObjectBuilder implements TypeBuilder<ast.ObjectType> {

    private _properties: PropertyBuilder[];

    constructor() {
        this._properties = [];
    }

    public with(property: PropertyBuilder): ObjectBuilder {
        this._properties.push(property);
        return this;
    }

    public build(): ast.ObjectType {
        const properties: ast.Property[] = [];
        for (const eachProperty of this._properties) {
            properties.push(eachProperty.build())
        }
        return new ast.ObjectType(properties);
    }

}


export function aProperty(name: string): PropertyBuilder  {
    return new PropertyBuilder(name);
}


class PropertyBuilder implements Builder<ast.Property> {

    private _name: string;
    private _type: TypeBuilder<any>;

    constructor(name: string) {
        this._name = name;
        this._type = new StringBuilder();
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
        return new ast.Property(this._name,
                                this._type.build());
    }
}





export function anArrayOf<T extends ast.Type>
    (entryType: TypeRef<T>): ArrayBuilder {
    if (typeof entryType === "string") {
        return new ArrayBuilder(new ReferenceBuilder(entryType as string));
    }
    return new ArrayBuilder(entryType as TypeBuilder<T>);
}




class ArrayBuilder implements TypeBuilder<ast.ArrayType> {

    private _contentType: TypeBuilder<any>;

    constructor (contentType: TypeBuilder<any>) {
        this._contentType = contentType;
    }

    public build(): ast.ArrayType {
        return new ast.ArrayType(this._contentType.build());
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


class UnionBuilder implements TypeBuilder<ast.Union> {

    private _candidateBuilders: TypeBuilder<any>[];

    constructor(candidateBuilders: TypeBuilder<any>[]) {
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


export function aString(): StringBuilder {
    return new StringBuilder();
}

class StringBuilder implements TypeBuilder<ast.StringType> {

    public build(): ast.StringType {
        return new ast.StringType();
    }

}

export function aNumber(): NumberBuilder {
    return new NumberBuilder();
}

class NumberBuilder implements TypeBuilder<ast.Number> {

    public build(): ast.Number {
        return new ast.Number();
    }

}

export function aBoolean(): BooleanBuilder {
    return new BooleanBuilder();
}

class BooleanBuilder implements TypeBuilder<ast.Boolean> {

    public build(): ast.Boolean {
        return new ast.Boolean();
    }

}


export class TypeDeclaration {

    private _name: string;
    private _type: TypeBuilder<any>;

    constructor (name: string) {
        this._name = name;
        this._type = new StringBuilder();
    }

    public isNamed(name: string) {
        return this._name === name;
    }

    public get type(): ast.Type {
        return this._type.build();
    }

    public as(type: TypeBuilder<any>): TypeDeclaration {
        this._type = type;
        return this;
    }

}
