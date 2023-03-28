# ThreadLocal

## 1 使用场景

* 在spring事务中，保证一个线程下，一个事务的多个操作拿到的是一个Connection

我们的程序每一次对数据库操作时都是一个新的数据库连接，如果数据库连接都不同的话，那事务就不复存在了。说白了，只要保证增删改 都是使用的一个数据库连接，那就可以保证事务。Spring的 @Transactional 内部就是使用了ThreadLocal 保存的数据库连接，而ThreadLocal保存的东西只有在当前线程可见，所以单个服务进行无论进行多少次增删改，实际上都是去ThreadLocal使用get方法获取同一个数据库连接进行操作，那么也就实现了事务。

* 在hiberate中管理session
* 在JDK8之前，为了解决SimpleDateFormat的线程安全问题

```java
import java.text.DateFormat;
import java.text.SimpleDateFormat;
 
public class DateUtils {
    public static final ThreadLocal<DateFormat> df = new ThreadLocal<DateFormat>(){
        @Override
        protected DateFormat initialValue() {
            return new SimpleDateFormat("yyyy-MM-dd");
        }
    };
}
```

使用

```java
DateUtils.df.get().format(new Date());
```

* 获取当前登录用户上下文。
* 临时保存权限数据。
* 使用MDC保存日志信息。

## 2 ThreadLocalMap为什么要用ThreadLocal做key，而不是用Thread做key

因为一个线程可能使用到多个TheadLocal，比如

```java
@Service
public class ThreadLocalService {
    private static final ThreadLocal<Integer> threadLocal1 = new ThreadLocal<>();
    private static final ThreadLocal<Integer> threadLocal2 = new ThreadLocal<>();
    private static final ThreadLocal<Integer> threadLocal3 = new ThreadLocal<>();
}
```

如果使用Thread作为key，就会出现不知道获取哪个`ThreadLocal`对象的情况

![img](https://pica.zhimg.com/v2-e8caa1dce1c39fcdd47d36c9d56c9093_r.jpg?source=1940ef5c)

因此，不能使用Thread做key，而应该改成用ThreadLocal对象做key

![img](https://picx.zhimg.com/v2-23b16c71499d3fbc76bf2083c2058d8f_r.jpg?source=1940ef5c)

## 3 线程池中使用ThreadLocal产生的内存泄露现象