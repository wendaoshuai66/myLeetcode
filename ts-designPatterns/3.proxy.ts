// 代理模式 为一个对像提供一个代用品或占位符，以便控制对它的访问

interface IUserDao {
    save(): void;
}
class UserDao implements IUserDao {
    public save() {
        console.log('保存11')
    }
}

class UserDaoProxy implements IUserDao {
    private target: IUserDao;
    constructor(target: IUserDao) {
        this.target = target;
    }

    save() {
        return this.target.save()
    }
}

const target: UserDao = new UserDao();
const proxy: UserDaoProxy = new UserDaoProxy(target);
proxy.save();