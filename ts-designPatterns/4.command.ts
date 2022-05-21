// 命令模式 命令是指一个执行某些特定事情的指令， 解决if else 非常方便

// 接受者角色类
class Receiver {
  public action(): void {
    console.log("执行操作");
  }
}

// 抽象命令角色类
interface Command {
  excute(): void;
}
class ConCreateCommand implements Command {
  private receiver: Receiver = null;

  constructor(receiver: Receiver) {
    this.receiver = receiver;
  }
  public excute(): void {
    this.receiver.action();
  }
}
// 请求者的类
class Invoker {
  private conmmant: Command = null;
  constructor(conmmant: Command) {
    this.conmmant = conmmant;
  }
  public action(): void {
    this.conmmant.excute();
  }
}

const receiver: Receiver = new Receiver();

const conCreateCommand: ConCreateCommand = new ConCreateCommand(receiver);

const invoker: Invoker = new Invoker(conCreateCommand);

invoker.action();
