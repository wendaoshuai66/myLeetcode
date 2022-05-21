//  单例模式

// 懒汉模式
class Singleton {
  private static instance: Singleton = null;
  constructor() {}
  public static getInstance(): Singleton {
    if (this.instance === null) {
      this.instance = new Singleton();
    }
    return this.instance;
  }
}
Singleton.getInstance();

// 饿汉单例

class HungrySingleton {
  private static instance: HungrySingleton = new HungrySingleton();

  public static getInstance(): HungrySingleton {
    return this.instance;
  }
}

// 用懒汉式单例模式模拟产生美国当今总统对象

class President {
    private static instance: President = null;

    public static getInstance():President {
        if (this.instance === null) {
            this.instance = new President();
        }
        return this.instance;
    }

    public getName():void {
        console.log('总统----')
    }
}

const president = President.getInstance();

president.getName();
