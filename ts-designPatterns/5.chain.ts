//  责任链模式（职责链模式）
// 目的 为了避免请求发送者与多个请求处理者耦合在一起，于是将所有请求的处理者通过前一对象记住其下一个对象的引用而连成一条链；当有请求发生时，可将请求沿着这条链传递，直到有对象处理它为止。
// 责任链模式是一种对象行为型模式

/**
 * 模式结构
 * 1.抽象处理者 （Handle） 角色： 定义一个处理请求的的接口，包含抽象处理方法和一个后继链接
 * 2.具体处理者  (Concrete Handler) 角色： 实现抽象处理者的处理方法，判断能否处理本次请求，如果可以处理请求则处理，否则将请求转给他的后继者
 * 3.客户类 (Client) 角色： 创建处理链，并向链头的具体处理者对象提交请求，它不关心处理细节和请求的传递过程
 * 责任链模式的本质是解耦请求与处理，让请求在处理链中能进行传递与被处理；理解责任链模式应当理解其模式，而不是其具体实现。责任链模式的独到之处是将其节点处理者组合成了链式结构，并允许节点自身决定是否进行请求处理或转发，相当于让请求流动起来。
 */

/**
 * @example 用责任链模式设计一个请假条审批模块。
 */
abstract class Handler {
  public successer: Handler;
  public abstract handlerRequest(user: string, day: number): void;
  public getNextHandler(): Handler {
    return this.successer;
  }
  public setNextHandler(handler: Handler) {
    this.successer = handler;
  }
}

class ClassAdviser extends Handler {
  public handlerRequest(user: string, days: number) {
    if (days <= 2) {
      console.log(`班主任批准${user}同学请假请求`);
    } else if (this.getNextHandler() !== null) {
      const nexeHandle = this.getNextHandler();
      nexeHandle.handlerRequest(user, days);
    }
    return null;
  }
}
class DepartmentHead extends Handler {
  public handlerRequest(user: string, days: number) {
    if (days <= 7) {
      console.log(`系主任批准${user}同学请假请求`);
    } else if (this.getNextHandler() !== null) {
      const nexeHandle = this.getNextHandler();
      nexeHandle.handlerRequest(user, days);
    }
    return null;
  }
}
class Dean extends Handler {
  public handlerRequest(user: string, days: number) {
    if (days <= 30) {
      console.log(`院长批准${user}同学请假请求`);
    } else if (this.getNextHandler() !== null) {
      const nexeHandle = this.getNextHandler();
      nexeHandle.handlerRequest(user, days);
    }
    return null;
  }
}

class SimpleFactory {
  public static TYPE_CLASS_ADVISER = 1;
  public static TYPE_DEPARTMENT_HEAD = 2;
  public static TYPE_DEAN = 3;
  public static createFactory(type: number) {
    switch (type) {
      case SimpleFactory.TYPE_CLASS_ADVISER:
        return new ClassAdviser();
      case SimpleFactory.TYPE_DEPARTMENT_HEAD:
        return new DepartmentHead();
      case SimpleFactory.TYPE_DEAN:
          return new Dean();
    }
  }
}
// 获取不同的处理对象
const h1: Handler = SimpleFactory.createFactory(SimpleFactory.TYPE_CLASS_ADVISER);
const h2: Handler = SimpleFactory.createFactory(SimpleFactory.TYPE_DEPARTMENT_HEAD);
const h3: Handler = SimpleFactory.createFactory(SimpleFactory.TYPE_DEAN);
// 设置角色的处理层次
h1.setNextHandler(h2);
h2.setNextHandler(h3);
h1.handlerRequest('👱', 7);
