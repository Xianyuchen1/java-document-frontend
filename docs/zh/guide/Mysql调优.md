# Mysql调优

## 1. 连接线程缓存thread_cache_size

[调优方法](https://qastack.cn/server/408845/what-value-of-thread-cache-size-should-i-use)

查询

```sh
show variables like 'thread_cache_size'; 

SHOW GLOBAL STATUS LIKE 'Connections';
SHOW GLOBAL STATUS LIKE 'Threads_created';
SHOW GLOBAL STATUS LIKE 'Max_used_connections';
```

修改

```sh
1、mysql> set global thread_cache_size=16
2、编辑/etc/my.cnf 更改/添加
thread_concurrency = 16
```

Thread Cache 命中率：

```
Thread_Cache_Hit = (Connections - Threads_created) / Connections * 100%;
```

一般在系统稳定运行一段时间后，Thread Cache命中率应该保持在90%左右才算正常。

## 2. 表定义信息缓存table_definition_cache

[相关文章](https://zhuanlan.zhihu.com/p/424477364)

为了不让 TDC 带来的好处消失, 我们建议始终保持状态 `Opened_table_definitions`小于参数`table_definition_cache`, 这样就能保证 TDC 始终命中。

相关查询如下

```sh
mysql> show global status like 'Opened_table_definitions';
+--------------------------+-------+
| Variable_name            | Value |
+--------------------------+-------+
| Opened_table_definitions | 378   |
+--------------------------+-------+
1 row in set (0.00 sec)

mysql> show variables like 'table_definition_cache';
+------------------------+-------+
| Variable_name          | Value |
+------------------------+-------+
| table_definition_cache | 2000  |
+------------------------+-------+
1 row in set (0.00 sec)
```

可以看到 `Opened_table_definitions`为378，小于参数`table_definition_cache`定义的2000

## 3. 最大连接数max_connections

> max_used_connections / max_connections * 100% （理想值≈ 85%） 

如果max_used_connections跟max_connections相同 那么就是max_connections设置过低或者超过服务器负载上限了，低于10%则设置过大。

查询

```sh
mysql> show variables like 'max_connections';
+-----------------+-------+
| Variable_name   | Value |
+-----------------+-------+
| max_connections | 1000  |
+-----------------+-------+
1 row in set (0.01 sec)

mysql> SHOW GLOBAL STATUS LIKE 'Max_used_connections';
+----------------------+-------+
| Variable_name        | Value |
+----------------------+-------+
| Max_used_connections | 313   |
+----------------------+-------+
1 row in set (0.00 sec)
```

比率为31.3%，符合要求

## 4. 临时表使用内存tmp_table_size

定义`MEMORY`存储引擎创建的内部内存临时表的最大大小，比较理想的配置是：

```
Created_tmp_disk_tables / Created_tmp_tables * 100% <= 25%
```

查询

```sh
mysql> show global status like 'created_tmp%';
+-------------------------+-------+
| Variable_name           | Value |
+-------------------------+-------+
| Created_tmp_disk_tables | 0     |
| Created_tmp_files       | 55    |
| Created_tmp_tables      | 993   |
+-------------------------+-------+
3 rows in set (0.00 sec)
```

磁盘创建的临时表为0，为最优

## 5. 慢查询

慢查询默认为关闭状态

开启和查询状态

```sh
mysql> set global slow_query_log=on;
Query OK, 0 rows affected (0.01 sec)

mysql> show variables like '%slow_query%';
+---------------------+------------------------------------------------+
| Variable_name       | Value                                          |
+---------------------+------------------------------------------------+
| slow_query_log      | ON                                             |
| slow_query_log_file | /var/lib/mysql/ecs-gacbd-interface-02-slow.log |
+---------------------+------------------------------------------------+
2 rows in set (0.00 sec)
```

## 6 innodb数据和索引缓存innodb_buffer_pool_size

查询状态

```sh
show variables like 'innodb_buffer_pool_size';
```

计算命中率

```sh
show status like 'innodb_buffer_pool_read%';
```

命中率为`innodb_buffer_pool_read_requests / (innodb_buffer_pool_read_requests + innodb_buffer_pool_reads ) * 100%`，若此值小于99%，考虑增大缓存

## 7 二进制日志缓存binlog_cache_size

查询

```sh
show variables like 'binlog_cache_size';
```

计算命中率

```sh
show global status like 'binlog_cache_%';
```

命中率为`Binlog_cache_use / (Binlog_cache_use + Binlog_cache_disk_use ) * 100%`，若此值小于99%，考虑增大缓存

## 8 表缓存table_open_cache

| 属性   | 值     |
| ------ | ------ |
| 默认值 | 2000   |
| 最小值 | 1      |
| 最大值 | 524288 |

查询

```sh
show variables like 'table_open_cache';
```

计算是否需要增加

```sh
SHOW GLOBAL STATUS LIKE 'Open%tables';
```

如果`Open_tables`的值等于`table_open_cache`，且`Opened_tables`远远大于`table_open_cache`，说明表缓存池快要满了 但 `Opened_tables` 还在一直有新的增长 这说明你还有很多未被缓存的表，这时可以适当增加 `table_open_cache` 的大小。

比较适合的值：

```
Open_tables / Opened_tables >= 0.85
Open_tables / table_open_cache <= 0.95
```

hit rate计算公式

```
hit rate = table_open_cache * 100 / Opened_tables = 0.5
```

hit rate 为 0.5 或 1.0 较好

设置

```sh
set global table_open_cache = 2048; （立即生效重启后失效）

MySQL 配置文件 my.cnf 中 mysqld 下添加 table_open_cache
[mysqld]
table_open_cache = 2048
```

