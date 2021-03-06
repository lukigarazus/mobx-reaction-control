![coverage lines](coverage/badge-lines.svg "Coverage lines") ![coverage functions](coverage/badge-functions.svg "Coverage functions") ![coverage branches](coverage/badge-branches.svg "Coverage branches") ![coverage statements](coverage/badge-statements.svg "Coverage statements")

# Mobx Reaction Control

## What is this?

This is a simple Mobx wrapper that enables you to control Mobx reactions. Let me show you:

```typescript
import { makeAutoObservableWithControl } from "mobx-reaction-control";
import { autorun } from "mobx";

const obj = makeAutoObservableWithControl({ a: 1 });

autorun(() => {
  console.log("Change", obj.a);
}); // Change 1

obj.a = 2; // Change 2

obj.pauseKey("a");

obj.a = 3; // Nothing, reaction was not triggered

console.log(obj.a); // 3, changes are still made

obj.resumeKey("a");

obj.a = 4; // Change 4
```

That's basically it, however the wrapper adds two more methods: `pauseAll` and `resumeAll`, if you want to pause all reactions on an object.

Here's the implemented interface:

```typescript
type IReactionControl<T> = {
  pauseKey: (...keys: (keyof T)[]) => void;
  resumeKey: (...keys: (keyof T)[]) => void;
  pauseAll: () => void;
  resumeAll: () => void;
} & T;
```

There's one more feature that could come in handy, namely `unfreeze reactions`. Let me show you:

```typescript
const obj = makeAutoObservableWithControl({ a: 1 }, undefined, undefined, true); // I added one more argument to the vanilla Mobx interface

autorun(() => {
  console.log("Change", obj.a);
}); // Change 1

obj.pauseKey("a");

obj.a = 2;

obj.resumeKey("a"); // Change 2, reactions are triggered if there were any changes to the "frozen" keys
```

### Warning

The functions exposed by this package are not recursive. You won't be able to control the behavior of nested objects. Moreover, TypeScript typings won't work correctly if you do this:

```typescript
const obj = { a: 1 };
makeAutoObservableWithControl(obj);
```

instead of this:

```typescript
const obj = makeAutoObservableWithControl({ a: 1 });
```

## Why would I use it?

I developed this package for myself to simplify the following scenario:

I have a Mobx-based form and a reaction that triggers a server request on any form model change. In most cases it works fine, but I wanted the ability to "batch" the changes without significant changes to the existing form logic. With this package all I need to do is add `formModel.pauseAll()` and `formModel.resumeAll()` invocations.
