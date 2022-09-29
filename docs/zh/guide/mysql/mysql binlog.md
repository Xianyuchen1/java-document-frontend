# mysql binlog

## 1 mysqlbinlog命令

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