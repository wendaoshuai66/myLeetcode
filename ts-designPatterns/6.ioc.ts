// ioc 注入

import { parseScript } from 'esprima';
import { CreateIoc } from './6.1.ioc';

const continer:CreateIoc = new CreateIoc();

interface ITYPES {
  [key: string]: Symbol;
}
// 首先简单说一下ioc 注入解决什么问题，下面简单举个例子
interface IUserService {
  log(str: string): void;
}
const TYPES:ITYPES ={
  userService: Symbol.for('userService'),
}

class UserService implements IUserService {
  log(str: string) {
    console.log(str);
  }
}
continer.bind(TYPES.userService, ()=> {
  return new UserService();
})
// 获取函数的参数
function getParmes(fn: Function) {
  let ast = parseScript(fn.toString());
  const node = ast.body[0];
  let fnPrammes = [];
  if (node.type === 'FunctionDeclaration') {
    fnPrammes = node.params;
  }
  const fnPrammesNames = [];
  fnPrammes.forEach((item)=> {
    if(item.type === 'Identifier') {
      fnPrammesNames.push(item.name)
    }
  })
  return fnPrammesNames;
}

function controller<T extends { new (...args: any[]): {} }>(constructor: T) {
  class Controller extends constructor {
    constructor(...args: any[]) {
      super(args);
      const parmes = getParmes(constructor);
      let identifier: string;
      for (identifier of parmes) {
        this[identifier] = continer.get(TYPES[identifier])
      }
    }
  }
  return Controller;
}
@controller
class UserController {
  public userService: UserService;
  constructor (userService?: UserService) {
    this.userService = userService;
  }
  info() {
    this.userService.log("你好");
  }
}

// 要让info 方法走通

/**
 * ① 方法内部添加其实列
 * ② 外层传入
 * constructor (userService: UserService) {
      this.userService = userService;
  }
 * const userService = new UserService();
 * const userController = new UserController(userService);
 * 
 * ③ 就是我们要说的ioc注入
 */

const index = new UserController();
 index.info();
