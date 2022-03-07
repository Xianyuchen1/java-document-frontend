# MAT使用

## 介绍

Eclipse Memory Analyzer（简称MAT）是一个功能丰富且操作简单的JVM Heap Dump分析工具，可以用来辅助发现内存泄漏减少内存占用。
使用 Memory Analyzer 来分析生产环境的 Java 堆转储文件，可以从数以百万计的对象中快速计算出对象的 Retained Size，查看是谁在阻止垃圾回收，并自动生成一个 Leak Suspect（内存泄露可疑点）报表。

## 安装

在http://www.eclipse.org/mat/downloads.php下载MAT并安装

注意：MAT需要JDK11以上支持，如果遇到安装了JDK11以上版本还是不能启动的情况，可以修改MAT目录下MemoryAnalyzer.ini来指定jdk路径，具体步骤是在MemoryAnalyzer.ini前面添加两行，第二行为jdk下javaw.exe的路径

```sh
-vm
D:\Program Files\Java\jdk-11.0.13\bin\javaw.exe
```

完整的示例如下

```sh
-vm
D:\Program Files\Java\jdk-11.0.13\bin\javaw.exe

-startup
plugins/org.eclipse.equinox.launcher_1.6.200.v20210416-2027.jar
--launcher.library
plugins/org.eclipse.equinox.launcher.win32.win32.x86_64_1.2.200.v20210429-1609
-vmargs
-Xmx1024m
```

## 使用

启动MAT之后打开 File - Open Heap Dump... 菜单，然后选择生成的Heap DUmp文件，选择 "Leak Suspects Report"，然后点击 "Finish" 按钮。

### 首页

![image-20220307191240363](https://xianyuchen-oss.oss-cn-shenzhen.aliyuncs.com/img/image-20220307191240363.png)

饼图显示了占用最多堆栈的对象，我们可以看到上方三种对象一共占用了一半的栈空间，下方白色部分为剩余的

以下内容摘自https://www.javatang.com/

接下来介绍界面中常用到的功能：
![img](http://www.javatang.com/wp-content/uploads/2017/10/843eb07db5728ab786cfbcb016d6809f.png)

### ![img](http://www.javatang.com/wp-content/uploads/2017/10/1bd31f8d4331c0cf4467c38b016118cd.png) Overview

Overview视图，即概要界面，显示了概要的信息，并展示了MAT常用的一些功能。

- Details 显示了一些统计信息，包括整个堆内存的大小、类（Class）的数量、对象（Object）的数量、类加载器（Class Loader)的数量。
- Biggest Objects by Retained Size 使用饼图的方式直观地显示了在JVM堆内存中最大的几个对象，当光标移到饼图上的时候会在左边Inspector和Attributes窗口中显示详细的信息。
- Actions 这里显示了几种常用到的操作，算是功能的快捷方式，包括 Histogram、Dominator Tree、Top Consumers、Duplicate Classes，具体的含义和用法见下面；
- Reports 列出了常用的报告信息，包括 Leak Suspects和Top Components，具体的含义和内容见下；
- Step By Step 以向导的方式引导使用功能。

### ![Histogram](http://www.javatang.com/wp-content/uploads/2017/10/fe892b246b43fa64b866790a2f256859.png) Histogram

直方图，可以查看每个类的实例（即对象）的数量和大小。

### ![img](http://www.javatang.com/wp-content/uploads/2017/10/5931b0544ead20fc50aba5efd828385e.png) Dominator Tree

支配树，列出Heap Dump中处于活跃状态中的最大的几个对象，默认按 retained size进行排序，因此很容易找到占用内存最多的对象。

### ![img](http://www.javatang.com/wp-content/uploads/2017/10/1c997cbcaac271fbef1a6768ec1485ed.png) OQL

MAT提供了一个对象查询语言（OQL），跟SQL语言类似，将类当作表、对象当作记录行、成员变量当作表中的字段。通过OQL可以方便快捷的查询一些需要的信息，是一个非常有用的工具。

### ![img](http://www.javatang.com/wp-content/uploads/2017/10/b16c2f91008e885eb9fd8aeb93d4bb31.png) Thread Overview

此工具可以查看生成Heap Dump文件的时候线程的运行情况，用于线程的分析。

### ![img](http://www.javatang.com/wp-content/uploads/2017/10/5243d42aa462821596a6bc6348d3ead0.png) Run Expert System Test

可以查看分析完成的HTML形式的报告，也可以打开已经产生的分析报告文件，子菜单项如下图所示：
![img](http://www.javatang.com/wp-content/uploads/2017/10/22d20d2d807b24c859b795846f587922.png)
常用的主要有Leak Suspects和Top Components两种报告：

- Leak Suspects 可以说是非常常用的报告了，该报告分析了 Heap Dump并尝试找出内存泄漏点，最后在生成的报告中对检测到的可疑点做了详细的说明；
- Top Components 列出占用总堆内存超过1%的对象。

### ![img](http://www.javatang.com/wp-content/uploads/2017/10/ea77da743bec2e5c8883a87f8e181a48.png) Open Query Browser

提供了在分析过程中用到的工具，通常都集成在了右键菜单中，在后面具体举例分析的时候会做详细的说明。如下图：
![img](http://www.javatang.com/wp-content/uploads/2017/10/c9f7a5b311c473627ddd281f52907e0a.png)

这里仅针对在 Overview 界面中的 Acations中列出的两项进行说明：

- Top Consumers 按类、类加载器和包分别进行查询，并以饼图的方式列出最大的几个对象。菜单打开方式如下：
  ![img](http://www.javatang.com/wp-content/uploads/2017/10/5e7a1762e03b51c263cb713f64461135.png)
- Duplicate Classes 列出被加载多次的类，结果按类加载器进行分组，目标是加载同一个类多次被类加载器加载。使用该工具很容易找到部署应用的时候使用了同一个库的多个版本。菜单打开方式如下图：
  ![img](http://www.javatang.com/wp-content/uploads/2017/10/cc8cbe62f8e41bb9da95edeba1a25a1b.png)

### ![img](http://www.javatang.com/wp-content/uploads/2017/10/8a21e1700c75e4e0acfb6dd2db536f1c.png) Find Object by address

通过十六进制的地址查找对应的对象，见下图：
![img](http://www.javatang.com/wp-content/uploads/2017/10/27e4a4532a75590d7e3a66f7101c9240.png)

## 实战

### 一些概念

#### Shallow Heap 和 Retained Heap

Shallow Heap表示对象本身占用内存的大小，不包含对其他对象的引用，也就是对象头加成员变量（不是成员变量的值）的总和。

Retained Heap是该对象自己的Shallow Heap，并加上从该对象能直接或间接访问到对象的Shallow Heap之和。换句话说，Retained Heap是该对象GC之后所能回收到内存的总和。

把内存中的对象看成下图中的节点，并且对象和对象之间互相引用。这里有一个特殊的节点GC Roots，这就是reference chain的起点。
![img](http://www.javatang.com/wp-content/uploads/2017/11/retained_objects.png)

从obj1入手，上图中蓝色节点代表仅仅只有通过obj1才能直接或间接访问的对象。因为可以通过GC Roots访问，所以左图的obj3不是蓝色节点；而在右图却是蓝色，因为它已经被包含在retained集合内。所以对于左图，obj1的retained size是obj1、obj2、obj4的shallow size总和；右图的retained size是obj1、obj2、obj3、obj4的shallow size总和。obj2的retained size可以通过相同的方式计算。

#### 对象引用（Reference）

对象引用按从最强到最弱有如下级别，不同的引用（可到达性）级别反映了对象的生命周期：

- 强引用（Strong Ref）：通常我们编写的代码都是强引用，于此相对应的是强可达性，只有去掉强可达性，对象才能被回收。
- 软引用（Soft Ref）：对应软可达性，只要有足够的内存就一直保持对象，直到发现内存不足且没有强引用的时候才回收对象。
- 弱引用（Weak Ref）：比软引用更弱，当发现不存在强引用的时候会立即回收此类型的对象，而不需要等到内存不足。通过java.lang.ref.WeakReference和java.util.WeakHashMap类实现。
- 虚引用（Phantom Ref）：根本不会在内存中保持该类型的对象，只能使用虚引用本身，一般用于在进入finalize()方法后进行特殊的清理过程，通过java.lang.ref.PhantomReference实现。

#### GC Roots和Reference Chain

JVM在进行GC的时候是通过使用可达性来判断对象是否存活，通过GC Roots（GC根节点）的对象作为起始点，从这些节点开始进行向下搜索，搜索所走过的路径成为Reference Chain（引用链），当一个对象到GC Roots没有任何引用链相连（用图论的话来说就是从GC Roots到这个对象不可达）时，则证明此对象是不可用的。

如下图所示，对象object 5、object 6、object 7虽然互相有关联，它们的引用并不为0，但是它们到GC Roots是不可达的，因此它们将会被判定为是可回收的对象。
![img](http://www.javatang.com/wp-content/uploads/2017/11/gc-roots.jpg)

### 实际分析

下面分析一个例子，来自测试服的dump数据

* 首先查看Leak Suspect

![image-20220307192542405](https://xianyuchen-oss.oss-cn-shenzhen.aliyuncs.com/img/image-20220307192542405.png)

显示有5个problem suspect，看一下详情

![image-20220307192822719](https://xianyuchen-oss.oss-cn-shenzhen.aliyuncs.com/img/image-20220307192822719.png)

显示一个tomcat线程持有的本地变量高达311MB，占了16.65%的堆内存，可以从keywords中看到似乎与`net.sf.json.util`有关，接下来，我们使用其他功能继续分析

* Histogram

Histogram可以查看每个类建立的对象的大小

![image-20220307193757399](https://xianyuchen-oss.oss-cn-shenzhen.aliyuncs.com/img/image-20220307193757399.png)

可以看到，占堆内存最大的是char数组和byte数组，排第三的是String对象

* dominator_tree

dominator_tree查看占用堆内存最多的对象

![image-20220307194430613](https://xianyuchen-oss.oss-cn-shenzhen.aliyuncs.com/img/image-20220307194430613.png)

我们可以发现四个tomcat的TaskThread，每个都占用了16.65%的堆内存，紧随其后的是4个自定义的WrapperResponse，每个占用了6.85%的堆内存

看一下TaskThread内部是什么：

![image-20220307194731338](https://xianyuchen-oss.oss-cn-shenzhen.aliyuncs.com/img/image-20220307194731338.png)

我们发现，`net.sf.json.util.JSONTokener`和`java.lang.String`对象占了大头，又看到这个String是一个JSON的返回体。由此，答案呼之欲出：返回的json过大，导致高并发情况下堆内存溢出，gc无法及时清理老年代中的这些json对象，同时，查看项目代码得知：项目中的WrapperResponse类对response又进行了一次包装，导致内存被进一步使用，由此，这次的问题结果就已经分析完成了，接下来要找到具体的方法代码，进一步排查原因

* thread overview

在thread overview中查看该线程的运行情况，可以发现ServeProcessFilter(打码位置)的`setResultInfo()`方法引用了WrapperResponse作为参数

![image-20220307195307190](https://xianyuchen-oss.oss-cn-shenzhen.aliyuncs.com/img/image-20220307195307190.png)

仔细查看项目代码，发现该filter是传入WrapperResponse的对象来进行日志埋点，然而，在埋点时候，以response为参数重新new了一个String对象，导致了巨量的堆内存使用

```java
private ServeVisitLogEntity setResultInfo(WrapperResponse response, ServeVisitLogEntity log) {
        int status = ((HttpServletResponse) response).getStatus();
        String resultCode = "";
        String resultInfo = "";
        if (status != 200) {
            resultCode = status + "";
            try {
                // 非200的话，则把response的内容取出来放到resultInfo中
                resultInfo = new String(response.getResponseData(), "UTF-8");
            } catch (IOException e) {
                resultInfo = "请求未处理完成，请参考返回码";
            }
        } else {
            // 从response中取返回结果
            resultCode = status + "";
            resultInfo = "返回结果异常";
            try {
                JSONObject json = JSONObject.fromObject(new String(response.getResponseData(), "UTF-8"));
                if (json.containsKey("code")) {
                    resultCode = json.getString("code");
                    resultInfo = !json.containsKey("data") ? "" : json.getString("data");
                }
            } catch (IOException e) {
                //这里也不做任何操作
            }

        }
        log.setRetCode(resultCode);
        log.setRetMsg(resultInfo);
        return log;
    }
```

由此，这次内存泄漏的原因已经找到了
