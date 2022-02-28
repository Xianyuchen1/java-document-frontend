module.exports = {
    title: "技术文档",
    description: "这是一个技术文档",
    base: '/java-document/',
    head: [
        ['link', { rel: 'icon', href: 'hero.png' }] // 需要被注入到当前页面的 HTML <head> 中的标签
    ],
    themeConfig: {
        logo: '/hero.png',
        nav: [
            { text: 'Home', link: '/' },
            {
                text: 'Mysql', items: [
                    { text: '事务', link: '/zh/guide/transaction/事务' },
                    { text: '多数据源', link: '/zh/guide/mysql/多数据源' },
                    { text: 'Mysql调优', link: '/zh/guide/Mysql调优' },
                ]
            },
            { text: 'Github', link: 'https://github.com/' },
            { text: 'Kubernetes', link: '/k8s/api-resources' }
        ],
        // 设置自动生成侧边栏
        // sidebar: 'auto',

        // 自定义侧边栏，为不同的页面组来显示不同的侧边栏
        // sidebar: {
        //     '/zh/guide/transaction/': [
        //         '',     /* /foo/ */
        //         '事务',  /* /foo/one.html */
        //     ],

        //     '/zh/guide/mysql/': [
        //         '',     /* /foo/ */
        //         '多数据源',  /* /foo/one.html */
        //     ],

        //     '/zh/guide/': [
        //         '',     /* /foo/ */
        //     ],
        // },

        // 也可以使用对象的形式
        sidebar: [
            {
                title: 'mysql',   // 必要的
                // path: '/foo/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
                collapsable: false, // 可选的, 默认值是 true,
                sidebarDepth: 3,    // 可选的, 默认值是 1
                children: [
                    '/zh/guide/transaction/事务',
                    '/zh/guide/mysql/多数据源',
                    '/zh/guide/Mysql调优',
                ]
            },
        ]
    }
}