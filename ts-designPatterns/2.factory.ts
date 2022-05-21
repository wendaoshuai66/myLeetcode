// 工厂模式 是我们常用的实例化对象模式了，用工厂方法代替new 操作的一种模式

abstract class INoodless {
  public abstract des(): void;
}

class LzNoodLes extends INoodless {
  public des(): void {
    console.log("面条1");
  }
}

class PmNoodLes extends INoodless {
  public des(): void {
    console.log("面条2");
  }
}

class WhNoodLes extends INoodless {
  public des(): void {
    console.log("面条3");
  }
}

class NoodlessFactory {
  //为了方便通过枚举，应该实通过代理
  public static TYPE_LZ = 1;
  public static TYPE_PM = 2;
  public static TYPE_WH = 3;

  public static createFactory(type: number): INoodless {
    switch (type) {
      case NoodlessFactory.TYPE_LZ:
        return new LzNoodLes();
      case NoodlessFactory.TYPE_PM:
        return new PmNoodLes();
      case NoodlessFactory.TYPE_WH:
        return new WhNoodLes();
      default:
        return new LzNoodLes();
    }
  }
}

const pmNoodLes = NoodlessFactory.createFactory(NoodlessFactory.TYPE_PM);

pmNoodLes.des();

// 通过上述更能够理解我们一般设计架构分层的理念
//  表现层-----》 业务逻辑层 BLL----》 数据访问层工厂类 DALFactory-----》 数据访问接口层 IDAL---- 》 数据访问接口层 DAL-----》 数据访问SqlServer封装层 ----》  数据库集群
