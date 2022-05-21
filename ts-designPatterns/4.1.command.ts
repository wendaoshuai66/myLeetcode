// 命令模式例子
/**
 * @description 客户去餐馆可选择的早餐有肠粉、河粉和馄饨等，
 * 客户可向服务员选择以上早餐中的若干种，服务员将客户的请求交给相关的厨师去做。
 * 这里的点早餐相当于“命令”，
 * 服务员相当于“调用者”，
 * 厨师相当于“接收者”，
 * 用命令模式实现比较合适。
 *
 * 1. 首先 定义一个早餐类 Breakfast 它是抽象命令类，有抽象方法cooking 说明要做什么
 * 2. 再定义其子类肠粉类 ChangFen 馄饨类 HunDun 河粉类 HeFen 它们是具体命令类，实现早餐类的 cooking()方法，但它们不会具体做，而是交给厨师去做
 * 3. 具体 厨师类有肠粉厨师 ChangFenChef 馄饨厨师 HunDunChef 河粉厨师 HeFenChef ，他们是命令的接收者
 */

//接收者：肠粉厨师
class ChangFenChef {
  public cooking() {
    console.log("做肠粉");
  }
}

//接受者: 馄饨师
class HunTunChef {
  public cooking() {
    console.log("做馄饨");
  }
}

//接收者： 河粉师
class HeFenChef {
  public cooking() {
    console.log("做河粉");
  }
}

// 抽象命令：早餐
interface Breakfast {
  cooKing(): void;
}

// 具体命令： 肠粉
class ChangFen implements Breakfast {
  private receiver: ChangFenChef;
  constructor(receiver: ChangFenChef) {
    this.receiver = receiver;
  }
  cooKing(): void {
    this.receiver.cooking();
  }
}

// 具体命令： 馄饨
class HunDun implements Breakfast {
  private receiver: HunTunChef;
  constructor(receiver: HunTunChef) {
    this.receiver = receiver;
  }
  cooKing(): void {
    this.receiver.cooking();
  }
}

// 具体命令: 河粉
class HeFen implements Breakfast {
  private receiver: HeFenChef;
  constructor(receiver: HeFenChef) {
    this.receiver = receiver;
  }
  cooKing(): void {
    this.receiver.cooking();
  }
}
class Factory {
  public static TYPE_CHANGFEN = 1;
  public static TYPE_HUNDUN = 2;
  public static TYPT_HENFEN = 3;
  public static createFactory(type: number): Breakfast {
    switch (type) {
      case Factory.TYPE_CHANGFEN:
        const receiverChangFen: ChangFenChef = new ChangFenChef();
        return new ChangFen(receiverChangFen);
      case Factory.TYPE_HUNDUN:
        const receiverHunTun: HunTunChef = new HunTunChef();
        return new HunDun(receiverHunTun);
      case Factory.TYPT_HENFEN:
        const receiver: HeFenChef = new HeFenChef();
        return new HeFen(receiver);
      default:
        const receiverChang: ChangFenChef = new ChangFenChef();
        return new ChangFen(receiverChang);
    }
  }
}
// 调用者： 服务员
class Waiter {
  private changFen: Breakfast;
  private hundun: Breakfast;
  private hefen: Breakfast;

  public setChangFen(f): void {
    this.changFen = f;
  }
  public chooseChangFen(): void {
    this.changFen.cooKing();
  }
  public setHundun(f): void {
    this.hundun = f;
  }
  public chooseChangHun(): void {
    this.hundun.cooKing();
  }

  public setHeFen(f): void {
    this.hefen = f;
  }
  public chooseHeFen(): void {
    this.hefen.cooKing();
  }
}

const food1 = Factory.createFactory(Factory.TYPE_CHANGFEN);
const food2 = Factory.createFactory(Factory.TYPE_HUNDUN);
const food3 = Factory.createFactory(Factory.TYPT_HENFEN);
const fwy = new Waiter();

fwy.setChangFen(food1); //设置肠粉菜单
fwy.setHundun(food2); //设置河粉菜单
fwy.setHeFen(food3); //设置馄饨菜单
fwy.chooseChangFen(); //选择肠粉
fwy.chooseHeFen(); //选择河粉
fwy.chooseChangHun(); //选择馄饨
