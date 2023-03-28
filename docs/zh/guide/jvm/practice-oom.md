# 实战：线上服务 OOM 排查

::: tip

截图是本地环境复现线上问题时截取的，用于描述线上环境真实发生的情况。

:::

## 初步定位问题

![image-20221013150224634](https://xianyuchen-oss.oss-cn-shenzhen.aliyuncs.com/img/image-20221013150224634.png)

用 Arthas 观察 JVM 内存情况，发现老年代内存使用率很高。

![image-20221013150243421](https://xianyuchen-oss.oss-cn-shenzhen.aliyuncs.com/img/image-20221013150243421.png)

继续观察发现老年代 GC 后内存使用率依然很高，推测存在内存泄漏。

## 进一步分析

![image-20221013150326392](https://xianyuchen-oss.oss-cn-shenzhen.aliyuncs.com/img/image-20221013150326392.png)

用 Arthas 把内存快照 `dump` 下来，用 Eclipse MAT 分析，发现一个 WeakCache 类型对象内存占比非常高。

> WeakCache——弱引用缓存。对于一个给定的键，其映射的存在并不阻止垃圾回收器对该键的丢弃，这就使该键成为可终止的，被终止，然后被回收。丢弃某个键时，其条目从映射中有效地移除。该类使用了 WeakHashMap 做为其实现，缓存的清理依赖于 JVM 的垃圾回收。

查看 Hutool 官方参考文档，根据文档描述当 Key 不再使用时，缓存能被 JVM 的清理。

```java
// 设置 JVM 参数 -Xmx2g
// 如果 WeakCache 不存在内存泄漏，这段代码不会 OOM
public class Main {
    public static void main(String[] args) {
        WeakCache<Integer, String> cache = new WeakCache<>(-1);
        for (int i = 0; i < 1_000_000_000; i++) {
            cache.put(i, RandomUtil.randomString(1024));
            System.out.println(i);
        }
    }
}
```

检查业务代码确认 Key 没有在别的地方被引用。编写代码对 WeakCache 进一步测试，确认 WeakCache 存在内存泄漏。

## 修复问题

[WeakCache 可能导致缓存无法被 gc，并导致应用最终 OOM](https://github.com/dromara/hutool/issues/1953)

[WeakCache 中弱引用失效](https://gitee.com/dromara/hutool/issues/I51O7M)

查了 GitHub 和 Gitee 的 Issues 发现已有相关讨论。WeakCache 内存泄漏的原因是 WeakCache 封装的 Value 中引用了 Key，导致缓存无法被 JVM 清理。

确认 Hutool 的 5.8.8 版本已修复 WeakCache 内存泄漏问题后把 Hutool 版本提到 5.8.8。
