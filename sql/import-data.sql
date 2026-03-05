-- Import existing data from Cloudflare D1 to Neon Postgres
-- Run this in Neon SQL Editor after running schema.sql

-- Import users (60 records)
INSERT INTO users (id, username, email, password_hash, avatar_url, created_at, updated_at) VALUES
('94tltzcqkmff8ifqn', 'Leah', '17864192301@163.com', 'lVQXwiz7DOPj9br1c0tfHYp+c2qMeMFKexIKai/UfCS9A+NTBH/D8PftHuT7InHg', NULL, '2025-09-11T09:57:14.927Z', '2025-09-11T09:57:14.927Z'),
('apm6xmyavmff8k28u', '0217', '2046188224@qq.com', 'mMNBFxMl+ISuQBL7CkQnraR4c+CBQgv/G6fwd3cRdOLyYO70DnztlDwedgkGs35f', NULL, '2025-09-11T09:58:30.750Z', '2025-09-11T09:58:30.750Z'),
('1eqzhkwvumff8mrd0', 'kantegger', 'yuhao83@gmail.com', 'OGmRal8cxYDGYXeI2hDHvcK6RGk1mD6MM7SZlArFlyiYRygMBQBqN5zpOkN1sArd', NULL, '2025-09-11T10:00:36.612Z', '2025-09-11T10:00:36.612Z'),
('5vgqecw3imff8xkrd', 'atom119', 'angelaqong@hotmail.com', 'CfTNSDZeVIKHz2qWJCZUy8b3U5jLI8q+ybb0TfjzbqvFWwsp00ipTQohnd1aA8Pj', NULL, '2025-09-11T10:09:01.273Z', '2025-09-11T10:09:01.273Z'),
('l0045skoumff8ywd0', '0106', 'seer46218@gmali.com', 'Ey1JnsEoiGeDc4ITfA3LoHYRCOJiE/5T/UbxumJGdOqWErOFpSzXDKpKUFbUkdoD', NULL, '2025-09-11T10:10:02.964Z', '2025-09-11T10:10:02.964Z'),
('edaq4c87mmffa5tyi', 'layne', 'esther.k@qq.com', 'n1hWkifWiQUdRzCYzW2RiK/R89qFMdx42AF2aOpcNnb53r3/U4+7j1c27ezNTpjO', NULL, '2025-09-11T10:43:26.058Z', '2025-09-11T10:43:26.058Z'),
('vsnmaljmjmffc4d21', 'leo', 'yuhao83@me.com', '9xptm3FMcKV/NnjaI6eGEdCR9sWGYDOV9nakANNdugOstd49nNoUDl9Pa6pkuDw3', NULL, '2025-09-11T11:38:16.729Z', '2025-09-11T11:38:16.729Z'),
('ws5qz9l8umffck4u7', 'test', 'test@test.com', 'L5o782yFoH13H1TmqvngJc4U0NyiJwkZVl/45q51oMh3Va/w2ICDwH6IonQVYj53', NULL, '2025-09-11T11:50:32.575Z', '2025-09-11T11:50:32.575Z'),
('zr45g8xcsmffcw1hw', 'Admin', '1@123.com', 'i20nG5859d0R7WtjB6egesZ3HTjnV8XkGEV+NR0vxU3jtxd0wiZIuy0gILijYiIH', NULL, '2025-09-11T11:59:48.116Z', '2025-09-11T11:59:48.116Z'),
('360skvwd6mffcyb7n', 'josiema', '15342334519@163.com', 'E9rJPFlTExqfeh3uCgW9y+v6MRnJOsWGWqHPesoRzWM93r1jJWnU3bmgAQISQ17w', NULL, '2025-09-11T12:01:34.019Z', '2025-09-11T12:01:34.019Z'),
('yujsq5ceomffi8idz', 'Sarial', 'aziwan@163.com', 'NmGpX/bYdTlZxFgQrIMBkw03YRsT+E96KqjtyWNMuqgQra/UxU8+dhAabBCUiqDA', NULL, '2025-09-11T14:29:27.959Z', '2025-09-11T14:29:27.959Z'),
('6z9i78d5vmffjddet', 'zrx', 'zrx.lov.ang0119.@qq.com', 'w39QRqShWJMZtHOZnjKeTmgRPq5ZY4Vp4qUOwb4I3+ygCERbiDkWs5m4d7mOdzsC', NULL, '2025-09-11T15:01:14.405Z', '2025-09-11T15:01:14.405Z'),
('zonijbk6ymffmonnl', 'aka_hazel', 'moment529@qq.com', 'JCkUPmDtSlxJdZhoO6PkrhAn2lzbtza80zbIxar0WK2H73yuMJe42dE4d3VkahuW', NULL, '2025-09-11T16:33:59.745Z', '2025-09-11T16:33:59.745Z'),
('74ss0ydcgmffpy5ft', 'dough7', 'cindy.learning.sth@gmail.com', 'wxEICGwumSITfXVAeI5GARQggjIU4gLNUP+SivjZt5gYFXNMTHWk9nEXa3l22ZbC', NULL, '2025-09-11T18:05:21.545Z', '2025-09-11T18:05:21.545Z'),
('6ctx3bbtemfg9w0v5', 'Eva', '2351687061@qq.com', 'DHNYZpbIOigJtimvcX25GhsbYP2sQlx+yWAbjEF7GXn0Jn7G98Q4RrTolLtE0IgA', NULL, '2025-09-12T03:23:34.625Z', '2025-09-12T03:23:34.625Z'),
('6sur8npjpmfgaggy7', 'muxilu', 'du_mild@163.com', '0qp0xXqJvL4F8y4JQfvuI/+O/RVVKJ6aSjB0BgS3odrF1fS2TbbPjZJTCRVBykES', NULL, '2025-09-12T03:39:28.591Z', '2025-09-12T03:39:28.591Z'),
('ez8p90amamfgb4xgw', 'Vivian', 'huangxiaoe2004@163.com', 'vYm9QTiogxAtWEIn7KfIk6Ogdwh0OPM591mPDRzmwoCyz6kiIZ7W11SD9EMDoveA', NULL, '2025-09-12T03:58:29.744Z', '2025-09-12T03:58:29.744Z'),
('qdckzdkagmfgbg3uv', 'chengran', '2230884787@qq.com', '8molroVTQvH+w+UkGCOmM02F5QXSim0+A/fBtMd9eX0jckiWdEzbOA76STwqZ/so', NULL, '2025-09-12T04:07:11.239Z', '2025-09-12T04:07:11.239Z'),
('umsvxektymfgbu5no', '77yuLyla_power', '2045422475@qq.com', 'Vl1Ue9wCNAVjDto60O+HI5Lp2VDakrSjScYeQ3ieH/5kSi7bRY4UYqDoOTYgtudr', NULL, '2025-09-12T04:18:06.756Z', '2025-09-12T04:18:06.756Z'),
('43i699ur5mfgcd7l9', 'yun', '2459396590@qq.com', 'k3bjNrDGm4ChkMHEr9bBKz8kaMA2mppel85lsc0EoonxbYlrkUlN43djolofoOzf', NULL, '2025-09-12T04:32:55.725Z', '2025-09-12T04:32:55.725Z'),
('3sebq3r34mfgcwa1x', 'chan', '420903124@qq.com', '2GAp0hmKTNJvObdX7gr6zImROunZ/iNOLvXzsQraZcOLAshh9YiH+SVs8CmCdu36', NULL, '2025-09-12T04:47:45.381Z', '2025-09-12T04:47:45.381Z'),
('a71bzewfmmfgd5d5u', 'guyemyo', 'remymiao@outlook.com', 'DgX1vVki0PDt1f/u531lKLxOmCzl1cnZz/1GkIrj0LoTgjQPe2jKDijjL7G7+Efq', NULL, '2025-09-12T04:54:49.314Z', '2025-09-12T04:54:49.314Z'),
('n6fqnnblxmfgdmpx7', 'chong', 'wangyue050415@163.com', 'D88jwnH9b4hrINHv/20W+RgxuZ4+0/isThq4Q/MV0eSR9L2INMWKEgD4tPRL3aFz', NULL, '2025-09-12T05:08:19.003Z', '2025-09-12T05:08:19.003Z'),
('1g8382eu7mfgfa9dx', 'JiaPeng', 'REXIOpj0106@outlook.com', 'xXTeK0eXuJNQCiymNSME+hfpYJQg+74fHnkdjGQ8oV6mE5737bXPVqPmOFqFrAaR', NULL, '2025-09-12T05:54:36.933Z', '2025-09-12T05:54:36.933Z'),
('9ar1xnhmlmfghdewd', 'Moira', 'nma277131@gmail.com', 'wKgEwvuBcGW/FVrfKj+vfw4C5Z2GnrYJjDk73HVgSpNEBJ4nP/7du9xzlHtmF/uC', NULL, '2025-09-12T06:53:03.277Z', '2025-09-12T06:53:03.277Z'),
('25r0k24ammfgib9hu', 'Wuyaaaivu', '2428094051@qq.com', '+B0N7eDp62gQxUAdT4rr9vVnfPY5obat+D/sIgSIGhSgV2LeNwdQlWucEFJwUI91', NULL, '2025-09-12T07:19:22.578Z', '2025-09-12T07:19:22.578Z'),
('3jj1879spmfgj6di1', 'Molamola', 'molamolam@163.com', '6aa4IN29aJhfO07B7QU5jK6yQlOnQlah7duxDESCb+FhuLGuJZ8xWffwE7qSF8F3', NULL, '2025-09-12T07:43:34.105Z', '2025-09-12T07:43:34.105Z'),
('t97l5r75qmfgjpca9', 'cuihua636403', 'cuihuajiatudou@qq.com', '9B7lm+NHKbr4qjOu5bb4TS0A3TqOaTafHwdPAX+IAMpX5He19oqnH8Z/F50DeRdi', NULL, '2025-09-12T07:58:18.993Z', '2025-09-12T07:58:18.993Z'),
('ky9knuzv3mfgk5h9t', 'Circe28', 'hmy272128@163.com', 'mCxZh5L6mlqNKJ7y60/7w4yZU1HjsaLZVRYhQW0o5uWHCyeX58ijgfv9Z5RZANIH', NULL, '2025-09-12T08:10:51.953Z', '2025-09-12T08:10:51.953Z'),
('px1ctuvenmfgnponq', 'PYbypy', '7.pybypy.7@gmail.com', 'GpEoEeJ5ZkeryTXEPiAlTZhSO1V9V7v/kESGD9ieCVXugThlSJmHl09ZS3bLU6HQ', NULL, '2025-09-12T09:50:33.494Z', '2025-09-12T09:50:33.494Z'),
('3qk8r6mffmfgv10wr', 'siakrulee', 'siakrulee@gmail.com', 'jGjEuhFJU0YrwXRpesS6z6Q/yNSl2GpwjX8Gh90tvOOQgQ4WbIVJZFixe411JXR6', NULL, '2025-09-12T13:15:19.899Z', '2025-09-12T13:15:19.899Z'),
('gifspn91mmfgw4tqh', '_Witch1', 'lihaiping942@gmail.com', 'fIWFHJr5yyWNT26ZVfekCyVQq14X8UXeW3SNOE/XM+xKXH+MeRrnALbkBU+vfigx', NULL, '2025-09-12T13:46:16.841Z', '2025-09-12T13:46:16.841Z'),
('qk4b9xhlzmfh0rias', 'Solynv', '2698952827@qq.com', 'eexjk/yE/z8yBUq7S741bpLOodvsRyFdz0/sDS9NKZuatTGGZBQpKJZh5Fwycw/W', NULL, '2025-09-12T15:55:53.572Z', '2025-09-12T15:55:53.572Z'),
('0lcrm1gh0mfh1pzwe', 'yishang', '2130694043@qq.com', 'S5cbBHX2nMps0QbMDrr6yM5bbGjhHfslnktKF9NN3Nk1+zPbgQeC3UvEtu6FDcQk', NULL, '2025-09-12T16:22:42.686Z', '2025-09-12T16:22:42.686Z'),
('lso3ot4dvmfh26ogp', 'LyraGreen', 'liuziyanisyyds@gmail.com', '9vveIereIUdEaWLLB4IqFz45Q7mBNgs9AKVQEnY02W3XYG703O+Gjs2eKKoBuWit', NULL, '2025-09-12T16:35:41.017Z', '2025-09-12T16:35:41.017Z'),
('kf64bpg0zmfh2wzil', 'Enthera', 'maggie_127lm@sina.com', 'wqFZxhLUWEfTXq7lcUbjcRWZI3H0KgayoYlvBl36pS/Pee+mcLE7+D+jrgx6GqIk', NULL, '2025-09-12T16:56:08.397Z', '2025-09-12T16:56:08.397Z'),
('uw00jv7vrmfhfcy62', 'Luyis', 'wenzor11@126.com', 'VpqxEUzTIc9Ka2UXYdidJ8ul5jW5GU1dYPi0EQWj1DjcIWv3NnamTLSz1AkRPbWB', NULL, '2025-09-12T22:44:28.538Z', '2025-09-12T22:44:28.538Z'),
('uqubk0qtymfhgodv2', 'wocy', 'wocy233@gmail.com', 'fltvplZMYEOHZ6LB43LGi5QxhUK81QwSwUHdQHDQyfQN1Y2riwCOiUlF+o2iC/ww', NULL, '2025-09-12T23:21:21.710Z', '2025-09-12T23:21:21.710Z'),
('vw6sjthy2mfhj7z8p', 'Wiz', 'Sharon200112@163.com', 'FJCXV+TrzJlaccaTiwWH++ZBlYcMPY3EA9vMlGxzI8Li1CyvwRBuCTdu+hK+CvGW', NULL, '2025-09-13T00:32:35.113Z', '2025-09-13T00:32:35.113Z'),
('vc9c41pjfmfhn0bfa', 'LANZE', 'siyu_hc@163.com', 'DSx0mXdPokQPSNOlp6ZzDw01NgWLnsbrx5usV1GAG52ZBDt0hyVRnbKKY2Zjcz7K', NULL, '2025-09-13T02:18:36.118Z', '2025-09-13T02:18:36.118Z'),
('krcw2wp0jmfhot777', 'zxccc', '3046457491@qq.com', 'fpj748Stva66GvdUFZccav4zmLla+m6MHVHExj8eS/SDRjX4meKKdaxbPiIVAdtn', NULL, '2025-09-13T03:09:03.283Z', '2025-09-13T03:09:03.283Z'),
('9kd7ggukjmfhr0j0u', 'doudou788966', '1043788966@qq.com', 'JYW1hoKO1lk55NkbirNVaA4PFphbEke+Ge/GgtSb75kPef0UWSmx6cbSibHa+7bn', NULL, '2025-09-13T04:10:44.430Z', '2025-09-13T04:10:44.430Z'),
('dfxmmjqs8mfhsuq8o', 'Linsen', '549225390@qq.com', 'tqI//05xaejERa4aMCxqjVLzPYVvaR2vRPAqZ9KJhXTTBYPM3tABQt0N6jRxUsjJ', NULL, '2025-09-13T05:02:13.080Z', '2025-09-13T05:02:13.080Z'),
('wj38etbixmfhw2rt1', 'Jane', 'jane5nflying@126.com', 'VsgJ9t5bsoKADQ/f7j5WH7b9NqKbbw30a9j2tQmLKuuqXov5rVWmiE27DySjBLnr', NULL, '2025-09-13T06:32:27.205Z', '2025-09-13T06:32:27.205Z'),
('35g5fy42gmfi1m894', 'R_C', '478842626@qq.com', 'JRJQC+uAVqaUkSGDi8Bt6GmFBQGDsGzfe647Gg8ByzWDC69y/c6OpxBJ8fVeM0W5', NULL, '2025-09-13T09:07:33.064Z', '2025-09-13T09:07:33.064Z'),
('mi1chx0vpmfic9gvi', 'treeinworld', 'nyree010101@gmail.com', 'RAQwPWPq8FA5R8VZbmYMe3DofFEudA9rTgCmbDjWAz04MeNVIt5IYFqJ8sWDNmJw', NULL, '2025-09-13T14:05:33.486Z', '2025-09-13T14:05:33.486Z'),
('2uld4v36hmfj18mkt', 'Kirby', 'a1737832376@gmail.com', 'M0nZPXgZf9brXAYtDe+WS3262BEOFsdaNKyeGbeWFFApcQnCuqpth1avuAgGBoAm', NULL, '2025-09-14T01:44:44.621Z', '2025-09-14T01:44:44.621Z'),
('6ljqf6s2gmfj2n8qb', 'Yell', 'v1257442362@163.com', 'LxVd0jV+4S3/OXKseSP7CVbJxx58XX2Q2fioJ4a9iZCdAmd9+nPjYhERiLvq1nz9', NULL, '2025-09-14T02:24:06.131Z', '2025-09-14T02:24:06.131Z'),
('rbfe2g7n2mfjjg6vs', 'kylinW', 'wiboring9981@gmail.com', '7DhmfsEucQlwAjMC9zXCPeNLI1aOJhrR4UZe044gyt5PcBmT1BWxHGX9WWfPO99w', NULL, '2025-09-14T10:14:30.616Z', '2025-09-14T10:14:30.616Z'),
('14wkc5bcxmfjvn3yq', 'Emma_Sh', 'wdlxhps@163.com', 'rBhLpOuC0PgLz18erKmNHSMzHsjKOr1POQdghU+Ns1UQXnMevFiYjn/pZ3FPC00L', NULL, '2025-09-14T15:55:48.818Z', '2025-09-14T15:55:48.818Z'),
('qo4xo9eummfk0v8t6', 'X__X', '3227237078@qq.com', 'CA8Oegca0IkLjXunsNaumtNhcJHO+3/uaUX8Ft7yQP5pvTAohcPtfi7VYUXx18Qq', NULL, '2025-09-14T18:22:06.426Z', '2025-09-14T18:22:06.426Z'),
('c64dqcpvjmfkophsr', 'Ele', 'hanyishi2@gmail.com', 'BHkH64EdtGXkyWBllpTay4jH6U4fVy0Agv610KObhu5fHW1maRQwsoewLufkZEAe', NULL, '2025-09-15T05:29:28.923Z', '2025-09-15T05:29:28.923Z'),
('jiefmuhjnmfm92yg2', 'Hannah', '3509694748@qq.com', 'EI+l2eszs1d03UR7H7jCR2L//8I7JYNKlDibfUFKKSFQzGj3QKKqxnR94oT8IAlw', NULL, '2025-09-16T07:47:35.522Z', '2025-09-16T07:47:35.522Z'),
('iv5b7p947mfmauvgs', 'isJustine', 'ximengru9926@163.com', 'f+daXQhG1RNZ/OXVNNAglqfitH2yBT+qzPng/Y/di7imwNfsOk5WSPJcq6h37qAW', NULL, '2025-09-16T08:37:17.644Z', '2025-09-16T08:37:17.644Z'),
('ytrovmrgemfmq7bzo', 'JWRapr09', '2753131277@qq.com', '+XF9hmckEqP8ajp5r1adzvO+fjELBJ8M2UYElZHCbGvWW0kiglM6RWt1Y/pb083m', NULL, '2025-09-16T15:46:53.172Z', '2025-09-16T15:46:53.172Z'),
('vxu7kzji1mfmua0e0', '沈萦青', 'yuseipost@163.com', 'wNIRl6oP0KfHtzJnZML7kzMZjFhnMGh7ZhYw/7cMNDTu3wby4PjrDW8WjyOGPMMh', NULL, '2025-09-16T17:40:56.568Z', '2025-09-16T17:41:39.250Z'),
('bg6jxep2umfmv64n0', 'M3teorite', 'meteorarrivedontime@gmail.com', 'vMgdkuW/zVNcNmKI8IPbG2kgG0fqsHMYlgAJ9pwqRL39pdGoiE8PfgOFmT1t5fWI', NULL, '2025-09-16T18:05:55.068Z', '2025-09-16T18:05:55.068Z'),
('78rmo0r95mfngxogv', 'joyasap', '2364282589@qq.com', '9XYxLrBI42B52QjD8K9MIPXLA2SVztugpzFE4KmFwnChEb5Dqv0ZptWtNYyxvRNX', NULL, '2025-09-17T04:15:12.415Z', '2025-09-17T04:15:12.415Z'),
('e0wxjpkfimfpg77qw', 'Lalalala', 'Okumura0826@outlook.com', 'eZzqc+Au0GKmRsJ23jP86J/TxEWZMn/Q9jOwx+RqS9A67YdL7R1d2fKON3xNdQHP', NULL, '2025-09-18T13:30:10.040Z', '2025-09-18T13:30:10.040Z'),
('6ayx400a2mfqv67ph', 'Hakuna', '373997978@qq.com', 'Al9sZMTvopnYGnVuwzgQeAbSYbSgZ2acVNKWu6hVFco1IFvR8FbokR/1ZqwF0hun', NULL, '2025-09-19T13:17:03.749Z', '2025-09-19T13:17:03.749Z'),
('qboaeppjdmfqw2s88', 'LilytheFrog', '1275960150@qq.com', 'r4J5KfhukDbvpDXiDUNVBkcew70RveFdk30Wkys2zNMTJfZDJPMQXwp/2MMgiWiC', NULL, '2025-09-19T13:42:23.336Z', '2025-09-19T13:42:23.336Z'),
('0hofay065mfr1s7fk', 'wuu', 'Allthebest_7@163.com', 'eP/I5La/wjDP7+tQ2z9yR9Ss/PX1zPaT0GC8OjCrrmrW/efNeLQd6KBUvEZW+QG8', NULL, '2025-09-19T16:22:07.520Z', '2025-09-19T16:22:07.520Z');

-- Import comments (4 records)
INSERT INTO comments (id, content, content_id, content_type, user_id, parent_id, likes_count, created_at, updated_at) VALUES
('7g3tbl2hqmffi9lis', '我是一个测试的评论。希望大家在这里既能畅所欲言又能遵守最起码的规则。谢谢。', 'book-bell-hooks-feminism-for-everybody', 'book', 'vsnmaljmjmffc4d21', NULL, 0, '2025-09-11T14:30:18.676Z', '2025-09-11T14:30:18.676Z'),
('ijlacd18jmfhr8rmf', '要是有对书籍的评分就好了，比如豆瓣评分', 'book-essential-labor', 'book', '9kd7ggukjmfhr0j0u', NULL, 0, '2025-09-13T04:17:08.823Z', '2025-09-13T04:17:08.823Z'),
('pcab73vjnmfi9hj6v', '好像不翻没法看 可能因为是youtube吧', 'video-meeting-the-enemy', 'video', '9kd7ggukjmfhr0j0u', NULL, 0, '2025-09-13T12:47:50.887Z', '2025-09-13T12:47:50.887Z'),
('on9qjbdrrmficzwmt', '关于这个，功能上要做肯定可以。实际上第一版就有。但之所以没有保留,出于一个考虑,那就是尽量不要在这样一个聚合平台做价值判断。即使分数是集体打的,比如豆瓣,也很可能因为场合不同而有不同的解读和效果。比如在这个平台,分高意味着更女性主义吗?即使多数人不这么理解,能保证所有人不这么理解吗?所以还是尽量只做聚合不做评价会更符合这里的初衷和愿景吧。', 'book-essential-labor', 'book', '1eqzhkwvumff8mrd0', 'ijlacd18jmfhr8rmf', 0, '2025-09-13T14:26:06.965Z', '2025-09-13T14:26:06.965Z');

-- comment_likes table is empty (no records to import)

-- Import user_interactions (27 records)
INSERT INTO user_interactions (id, user_id, content_id, content_type, interaction_type, created_at) VALUES
('la0a9unsvmffi2usx', 'vsnmaljmjmffc4d21', 'book-feminine-mystique', 'book', 'like', '2025-09-11T14:25:04.113Z'),
('qpd5qgbrgmffi30nw', 'vsnmaljmjmffc4d21', 'book-feminine-mystique', 'book', 'bookmark', '2025-09-11T14:25:11.708Z'),
('ytfpzecd3mffi505u', 'vsnmaljmjmffc4d21', 'video-meeting-the-enemy', 'video', 'bookmark', '2025-09-11T14:26:44.370Z'),
('qsctga443mffi50t8', 'vsnmaljmjmffc4d21', 'video-meeting-the-enemy', 'video', 'like', '2025-09-11T14:26:45.212Z'),
('fcliwaudfmfgbizq3', 'qdckzdkagmfgbg3uv', 'book-gender-trouble', 'book', 'like', '2025-09-12T04:09:25.851Z'),
('m25fhodv8mfgbuyzt', 'qdckzdkagmfgbg3uv', 'book-bad-feminist', 'book', 'like', '2025-09-12T04:18:44.777Z'),
('xh9a6133amfgd49a3', 'qdckzdkagmfgbg3uv', 'book-hood-feminism', 'book', 'like', '2025-09-12T04:53:57.627Z'),
('kt3ubil03mfgebq5y', 'qdckzdkagmfgbg3uv', 'book-braiding-sweetgrass', 'book', 'like', '2025-09-12T05:27:45.718Z'),
('k7j56ubwamfgevg27', 'qdckzdkagmfgbg3uv', 'article-workplace-gender-gap-2025', 'article', 'like', '2025-09-12T05:43:05.743Z'),
('l7wa17ze8mfh32700', 'kf64bpg0zmfh2wzil', 'podcast-engendered', 'podcast', 'like', '2025-09-12T17:00:11.376Z'),
('poulvbq3gmfh3280d', 'kf64bpg0zmfh2wzil', 'podcast-black-feminist-rants', 'podcast', 'like', '2025-09-12T17:00:12.685Z'),
('c2yuhw13smfh3296f', 'kf64bpg0zmfh2wzil', 'podcast-big-bitch-energy', 'podcast', 'like', '2025-09-12T17:00:14.199Z'),
('aubr35dspmfh32a85', 'kf64bpg0zmfh2wzil', 'podcast-bad-feminist-film-club', 'podcast', 'like', '2025-09-12T17:00:15.557Z'),
('y7nq4v6knmfh32asj', 'kf64bpg0zmfh2wzil', 'video-feminism-intro-bilibili', 'video', 'like', '2025-09-12T17:00:16.291Z'),
('rr187nkzvmfh32bmk', 'kf64bpg0zmfh2wzil', 'video-feminism-debate-kelly-peterson', 'video', 'like', '2025-09-12T17:00:17.372Z'),
('piql1r6ypmfh32cr0', 'kf64bpg0zmfh2wzil', 'article-china-women-workplace-equality', 'article', 'like', '2025-09-12T17:00:18.828Z'),
('38tx97znkmfh32dlu', 'kf64bpg0zmfh2wzil', 'article-workplace-gender-gap-2025', 'article', 'like', '2025-09-12T17:00:19.938Z'),
('chbgkrgegmfi3mwfk', 'vsnmaljmjmffc4d21', 'film-little-women-2019', 'film', 'like', '2025-09-13T10:04:03.632Z'),
('wo8e47kkvmfi3o8ka', 'vsnmaljmjmffc4d21', 'film-portrait-of-a-lady-on-fire', 'film', 'like', '2025-09-13T10:05:06.010Z'),
('l66i36i97mfi611cv', '1eqzhkwvumff8mrd0', 'film-little-women-2019', 'film', 'like', '2025-09-13T11:11:02.431Z'),
('jpehu5fu8mfi61290', '1eqzhkwvumff8mrd0', 'film-portrait-of-a-lady-on-fire', 'film', 'like', '2025-09-13T11:11:03.588Z'),
('8gqi81t2qmfi7a2te', '1eqzhkwvumff8mrd0', 'book-know-my-name', 'book', 'like', '2025-09-13T11:46:03.842Z'),
('rwldzz0w4mfpg7dbt', 'e0wxjpkfimfpg77qw', 'book-the-male-complaint', 'book', 'like', '2025-09-18T13:30:17.273Z'),
('0o69gm7tsmfpg7f9j', 'e0wxjpkfimfpg77qw', 'book-enemy-feminisms', 'book', 'like', '2025-09-18T13:30:19.783Z'),
('ct249gn27mfpg7hwo', 'e0wxjpkfimfpg77qw', 'book-essential-labor', 'book', 'like', '2025-09-18T13:30:23.208Z'),
('30pqyyt8mmfsfdcud', '1eqzhkwvumff8mrd0', 'book-tomorrow-sex-will-be-good-again', 'book', 'like', '2025-09-20T15:30:15.493Z'),
('2660y60zfmfsfdfz1', '1eqzhkwvumff8mrd0', 'book-tomorrow-sex-will-be-good-again', 'book', 'bookmark', '2025-09-20T15:30:19.549Z');

-- Verify import
SELECT 'Users imported:' as status, COUNT(*) as count FROM users
UNION ALL
SELECT 'Comments imported:', COUNT(*) FROM comments
UNION ALL
SELECT 'Comment likes imported:', COUNT(*) FROM comment_likes
UNION ALL
SELECT 'User interactions imported:', COUNT(*) FROM user_interactions;
