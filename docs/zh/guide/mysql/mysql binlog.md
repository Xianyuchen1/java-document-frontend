# mysql binlog

## 1. mysqlbinlog命令

常用使用方法，使用管道符输出为sql文件

```sh
mysqlbinlog -vv --base64-output=decode-rows --database=test > 2.sql
```

常用参数解释

* [`--verbose`](https://dev.mysql.com/doc/refman/5.7/en/mysqlbinlog.html#option_mysqlbinlog_verbose), `-v`

从行格式中重建伪SQL(带注释)，不显示 binlog_rows_query_log_events 参数效果：

* `-vv`, `--verbose --verbose`

从行格式中重建伪SQL并添加字段数据类型的注释，可以显示 binlog_rows_query_log_events 参数效果，区别在于，-v不会显示具体的字段类型，比如`-v`不会显示具体的update sql，`-vv`就会显示具体的update sql

* `--base64-output=decode-rows`

不显示行格式，如果同时加 -v 参数，可以从行格式中解码为带注释的伪SQL：

```sh
$> mysqlbinlog -v --base64-output=DECODE-ROWS log_file
...
# at 218
#080828 15:03:08 server id 1  end_log_pos 258   Write_rows: table id 17 flags: STMT_END_F
### INSERT INTO test.t
### SET
###   @1=1
###   @2='apple'
###   @3=NULL
...
# at 302
#080828 15:03:08 server id 1  end_log_pos 356   Update_rows: table id 17 flags: STMT_END_F
### UPDATE test.t
### WHERE
###   @1=1
###   @2='apple'
###   @3=NULL
### SET
###   @1=1
###   @2='pear'
###   @3='2009:01:01'
...
# at 400
#080828 15:03:08 server id 1  end_log_pos 442   Delete_rows: table id 17 flags: STMT_END_F
### DELETE FROM test.t
### WHERE
###   @1=1
###   @2='pear'
###   @3='2009:01:01'
```

如果把上面的`-v`改为`-vv`，就可以获取具体的`update sql`

## 2. 如何定位binlog文件并输出

执行sql，从`File`字段获取binlog名字

```sql
show master status;
```

在mysql所在服务器全局搜索该文件名称

```sh
find / -name [文件名]
```

找到文件位置后，使用`mysqlbinlog`命令导出为sql，如

```sh
mysqlbinlog --no-defaults -vv --base64-output=decode-rows --database=[数据库名] [binlog文件名] > /usr/local/temp/binlog.sql
```

## 3. 常见问题处理

注意，使用mysqlbinlog命令时如果出现错误如下

```sh
mysqlbinlog: unknown variable 'default_character_set=utf8mb4'
```

需要在`mysqlbinlog`命令之后第一个指定`--no-defaults`

参数释义如下：

- [`--no-defaults`](https://dev.mysql.com/doc/refman/5.7/en/mysqlbinlog.html#option_mysqlbinlog_no-defaults)

  Do not read any option files. If program startup fails due to reading unknown options from an option file, [`--no-defaults`](https://dev.mysql.com/doc/refman/5.7/en/mysqlbinlog.html#option_mysqlbinlog_no-defaults) can be used to prevent them from being read.

  The exception is that the `.mylogin.cnf` file is read in all cases, if it exists. This permits passwords to be specified in a safer way than on the command line even when [`--no-defaults`](https://dev.mysql.com/doc/refman/5.7/en/mysqlbinlog.html#option_mysqlbinlog_no-defaults) is used. To create `.mylogin.cnf`, use the [**mysql_config_editor**](https://dev.mysql.com/doc/refman/5.7/en/mysql-config-editor.html) utility. See [Section 4.6.6, “mysql_config_editor — MySQL Configuration Utility”](https://dev.mysql.com/doc/refman/5.7/en/mysql-config-editor.html).

  For additional information about this and other option-file options, see [Section 4.2.2.3, “Command-Line Options that Affect Option-File Handling”](https://dev.mysql.com/doc/refman/5.7/en/option-file-options.html).



要注意，执行mysqlbinlog命令最好在mysql所在的机子上执行，避免`mysqlbinlog`版本本机与服务器上不统一的情况，可能会有如下报错

```sh
ERROR: Could not read entry at offset 256: Error in log format or read error 1.
ERROR: Found invalid event in binary log
```

