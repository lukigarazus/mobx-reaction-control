import "jest";
import { autorun, observable } from "mobx";
import {
  makeAutoObservableWithControl,
  makeObservableWithControl,
} from "../index";

describe("mobx-reaction-control", () => {
  describe("makeAutoObservableWithControl", () => {
    it("works exactly as vanilla mobx", () => {
      const f = jest.fn();
      const obj = { a: 1 };
      makeAutoObservableWithControl(obj);
      autorun(() => {
        obj.a;
        f();
      });
      expect(f).toHaveBeenCalledTimes(1);
      obj.a = 2;
      expect(obj.a).toEqual(2);
      expect(f).toHaveBeenCalledTimes(2);
    });
    it("pausing key reactions works", () => {
      const f = jest.fn();
      const obj = makeAutoObservableWithControl({ a: 1 });
      autorun(() => {
        obj.a;
        f();
      });
      expect(f).toHaveBeenCalledTimes(1);
      obj.pauseKey("a");
      obj.a = 2;
      expect(obj.a).toEqual(2);
      expect(f).toHaveBeenCalledTimes(1);
    });
    it("resuming key reactions works", () => {
      const f = jest.fn();
      const obj = makeAutoObservableWithControl({ a: 1 });
      autorun(() => {
        obj.a;
        f();
      });
      expect(f).toHaveBeenCalledTimes(1);
      obj.pauseKey("a");
      obj.a = 2;
      expect(obj.a).toEqual(2);
      expect(f).toHaveBeenCalledTimes(1);
      obj.resumeKey("a");
      obj.a = 3;
      expect(obj.a).toEqual(3);
      expect(f).toHaveBeenCalledTimes(2);
    });
    it("pausing all reactions works", () => {
      const f = jest.fn();
      const obj = makeAutoObservableWithControl({ a: 1, b: 1 });
      autorun(() => {
        obj.a;
        obj.b;
        f();
      });
      obj.a = 2;
      obj.b = 2;
      expect(f).toHaveBeenCalledTimes(3);
      obj.pauseAll();
      obj.a = 3;
      obj.b = 3;
      expect(obj.a).toEqual(3);
      expect(obj.b).toEqual(3);
      expect(f).toHaveBeenCalledTimes(3);
    });
    it("resuming all reactions works", () => {
      const f = jest.fn();
      const obj = makeAutoObservableWithControl({ a: 1, b: 1 });
      autorun(() => {
        obj.a;
        obj.b;
        f();
      });
      obj.a = 2;
      obj.b = 2;
      expect(f).toHaveBeenCalledTimes(3);
      obj.pauseAll();
      obj.a = 3;
      obj.b = 3;
      expect(obj.a).toEqual(3);
      expect(obj.b).toEqual(3);
      expect(f).toHaveBeenCalledTimes(3);
      obj.resumeAll();
      obj.a = 4;
      obj.b = 4;
      expect(obj.a).toEqual(4);
      expect(obj.b).toEqual(4);
      expect(f).toHaveBeenCalledTimes(5);
    });
    describe("react on unfreeze", () => {
      it("works when changes were made", () => {
        const f = jest.fn();
        const obj = makeAutoObservableWithControl(
          { a: 1 },
          undefined,
          undefined,
          true
        );
        autorun(() => {
          obj.a;
          f();
        });
        expect(f).toHaveBeenCalledTimes(1);
        obj.pauseKey("a");
        obj.a = 2;
        obj.resumeKey("a");
        expect(f).toHaveBeenCalledTimes(2);
      });
      it("works when changes were not made", () => {
        const f = jest.fn();
        const obj = makeAutoObservableWithControl(
          { a: 1 },
          undefined,
          undefined,
          true
        );
        autorun(() => {
          obj.a;
          f();
        });
        expect(f).toHaveBeenCalledTimes(1);
        obj.pauseKey("a");
        obj.resumeKey("a");
        expect(f).toHaveBeenCalledTimes(1);
      });
      it("works when changes were made - all", () => {
        const f = jest.fn();
        const obj = makeAutoObservableWithControl(
          { a: 1 },
          undefined,
          undefined,
          true
        );
        autorun(() => {
          obj.a;
          f();
        });
        expect(f).toHaveBeenCalledTimes(1);
        obj.pauseAll();
        obj.a = 2;
        obj.resumeAll();
        expect(f).toHaveBeenCalledTimes(2);
      });
      it("works when changes were not made - all", () => {
        const f = jest.fn();
        const obj = makeAutoObservableWithControl(
          { a: 1 },
          undefined,
          undefined,
          true
        );
        autorun(() => {
          obj.a;
          f();
        });
        expect(f).toHaveBeenCalledTimes(1);
        obj.pauseAll();
        obj.resumeAll();
        expect(f).toHaveBeenCalledTimes(1);
      });
    });
  });
  describe("makeObservableWithControl", () => {
    it("pause and resume works", () => {
      const f = jest.fn();
      const obj = makeObservableWithControl({ a: 1 }, { a: observable });
      autorun(() => {
        obj.a;
        f();
      });
      obj.a = 2;
      expect(obj.a).toEqual(2);
      expect(f).toHaveBeenCalledTimes(2);
      obj.pauseKey("a");
      obj.a = 3;
      expect(obj.a).toEqual(3);
      expect(f).toHaveBeenCalledTimes(2);
      obj.resumeKey("a");
      obj.a = 4;
      expect(obj.a).toEqual(4);
      expect(f).toHaveBeenCalledTimes(3);
    });
    it("works with no config", () => {
      const f = jest.fn();
      const obj = makeObservableWithControl({ a: 1 });
      autorun(() => {
        obj.a;
        f();
      });
      obj.a = 2;
      expect(obj.a).toEqual(2);
      expect(f).toHaveBeenCalledTimes(1);
    });
  });
});
