###
jquery-migrate.min.js?ver=1.4.0:2 JQMIGRATE: Migrate is installed, version 1.4.0
embed-travis.coffee:119 Using worker: worker-linux-docker-21af87a6.prod.travis-ci.org:travis-linux-13

travis_fold:start:system_info
[0K[33;1mBuild system information[0m
Build language: php
Build group: stable
Build dist: precise
[34m[1mBuild image provisioning date and time[0m
Thu Feb  5 15:09:33 UTC 2015
[34m[1mOperating System Details[0m
Distributor ID:	Ubuntu
Description:	Ubuntu 12.04.5 LTS
Release:	12.04
Codename:	precise
[34m[1mLinux Version[0m
3.13.0-29-generic
[34m[1mCookbooks Version[0m
a68419e https://github.com/travis-ci/travis-cookbooks/tree/a68419e
[34m[1mGCC version[0m
gcc (Ubuntu/Linaro 4.6.3-1ubuntu5) 4.6.3
Copyright (C) 2011 Free Software Foundation, Inc.
This is free software; see the source for copying conditions.  There is NO
warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

[34m[1mLLVM version[0m
clang version 3.4 (tags/RELEASE_34/final)
Target: x86_64-unknown-linux-gnu
Thread model: posix
[34m[1mPre-installed Ruby versions[0m
ruby-1.9.3-p551
[34m[1mPre-installed Node.js versions[0m
v0.10.36
[34m[1mPre-installed Go versions[0m
1.4.1
[34m[1mRedis version[0m
redis-server 2.8.19
[34m[1mriak version[0m
2.0.2
[34m[1mMongoDB version[0m
MongoDB 2.4.12
[34m[1mCouchDB version[0m
couchdb 1.6.1
[34m[1mNeo4j version[0m
1.9.4
[34m[1mRabbitMQ Version[0m
3.4.3
[34m[1mElasticSearch version[0m
1.4.0
[34m[1mInstalled Sphinx versions[0m
2.0.10
2.1.9
2.2.6
[34m[1mDefault Sphinx version[0m
2.2.6
[34m[1mInstalled Firefox version[0m
firefox 31.0esr
[34m[1mPhantomJS version[0m
1.9.8
[34m[1mant -version[0m
Apache Ant(TM) version 1.8.2 compiled on December 3 2011
[34m[1mmvn -version[0m
Apache Maven 3.2.5 (12a6b3acb947671f09b81f49094c53f426d8cea1; 2014-12-14T17:29:23+00:00)
Maven home: /usr/local/maven
Java version: 1.7.0_76, vendor: Oracle Corporation
Java home: /usr/lib/jvm/java-7-oracle/jre
Default locale: en_US, platform encoding: ANSI_X3.4-1968
OS name: "linux", version: "3.13.0-29-generic", arch: "amd64", family: "unix"
travis_fold:end:system_info
[0K
travis_fold:start:fix.CVE-2015-7547
[0K$ export DEBIAN_FRONTEND=noninteractive
W: Size of file /var/lib/apt/lists/dl.hhvm.com_ubuntu_dists_precise_main_binary-amd64_Packages.gz is not what the server reported 2047 2461
W: Size of file /var/lib/apt/lists/us.archive.ubuntu.com_ubuntu_dists_precise-backports_multiverse_source_Sources.gz is not what the server reported 5886 5888
W: Size of file /var/lib/apt/lists/ppa.launchpad.net_ubuntugis_ppa_ubuntu_dists_precise_main_binary-amd64_Packages.gz is not what the server reported 36669 36677
W: Size of file /var/lib/apt/lists/ppa.launchpad.net_ubuntugis_ppa_ubuntu_dists_precise_main_binary-i386_Packages.gz is not what the server reported 36729 36733
Reading package lists...
Building dependency tree...
Reading state information...
The following extra packages will be installed:
  libc-bin libc-dev-bin libc6-dev
Suggested packages:
  glibc-doc
The following packages will be upgraded:
  libc-bin libc-dev-bin libc6 libc6-dev
4 upgraded, 0 newly installed, 0 to remove and 228 not upgraded.
Need to get 8,844 kB of archives.
After this operation, 9,216 B disk space will be freed.
Get:1 http://us.archive.ubuntu.com/ubuntu/ precise-updates/main libc6-dev amd64 2.15-0ubuntu10.13 [2,943 kB]
Get:2 http://us.archive.ubuntu.com/ubuntu/ precise-updates/main libc-dev-bin amd64 2.15-0ubuntu10.13 [84.7 kB]
Get:3 http://us.archive.ubuntu.com/ubuntu/ precise-updates/main libc-bin amd64 2.15-0ubuntu10.13 [1,179 kB]
Get:4 http://us.archive.ubuntu.com/ubuntu/ precise-updates/main libc6 amd64 2.15-0ubuntu10.13 [4,637 kB]
Fetched 8,844 kB in 0s (31.1 MB/s)
Preconfiguring packages ...
(Reading database ...
(Reading database ... 5%
(Reading database ... 10%
(Reading database ... 15%
(Reading database ... 20%
(Reading database ... 25%
(Reading database ... 30%
(Reading database ... 35%
(Reading database ... 40%
(Reading database ... 45%
(Reading database ... 50%
(Reading database ... 55%
(Reading database ... 60%
(Reading database ... 65%
(Reading database ... 70%
(Reading database ... 75%
(Reading database ... 80%
(Reading database ... 85%
(Reading database ... 90%
(Reading database ... 95%
(Reading database ... 100%
(Reading database ... 70845 files and directories currently installed.)
Preparing to replace libc6-dev 2.15-0ubuntu10.10 (using .../libc6-dev_2.15-0ubuntu10.13_amd64.deb) ...
Unpacking replacement libc6-dev ...
Preparing to replace libc-dev-bin 2.15-0ubuntu10.10 (using .../libc-dev-bin_2.15-0ubuntu10.13_amd64.deb) ...
Unpacking replacement libc-dev-bin ...
Preparing to replace libc-bin 2.15-0ubuntu10.10 (using .../libc-bin_2.15-0ubuntu10.13_amd64.deb) ...
Unpacking replacement libc-bin ...
Processing triggers for man-db ...
Setting up libc-bin (2.15-0ubuntu10.13) ...
(Reading database ...
(Reading database ... 5%
(Reading database ... 10%
(Reading database ... 15%
(Reading database ... 20%
(Reading database ... 25%
(Reading database ... 30%
(Reading database ... 35%
(Reading database ... 40%
(Reading database ... 45%
(Reading database ... 50%
(Reading database ... 55%
(Reading database ... 60%
(Reading database ... 65%
(Reading database ... 70%
(Reading database ... 75%
(Reading database ... 80%
(Reading database ... 85%
(Reading database ... 90%
(Reading database ... 95%
(Reading database ... 100%
(Reading database ... 70845 files and directories currently installed.)
Preparing to replace libc6 2.15-0ubuntu10.10 (using .../libc6_2.15-0ubuntu10.13_amd64.deb) ...
Unpacking replacement libc6 ...
Setting up libc6 (2.15-0ubuntu10.13) ...
Setting up libc-dev-bin (2.15-0ubuntu10.13) ...
Setting up libc6-dev (2.15-0ubuntu10.13) ...
Processing triggers for libc-bin ...
ldconfig deferred processing now taking place
travis_fold:end:fix.CVE-2015-7547
[0Ktravis_fold:start:git.checkout
[0Ktravis_time:start:04c88743
[0K$ git clone --depth=50 --branch=master https://github.com/KamataRyo/embed-travis.git KamataRyo/embed-travis
Cloning into 'KamataRyo/embed-travis'...
remote: Counting objects: 246, done.[K
remote: Compressing objects:   0% (1/145)   [K
remote: Compressing objects:   1% (2/145)   [K
remote: Compressing objects:   2% (3/145)   [K
remote: Compressing objects:   3% (5/145)   [K
remote: Compressing objects:   4% (6/145)   [K
remote: Compressing objects:   5% (8/145)   [K
remote: Compressing objects:   6% (9/145)   [K
remote: Compressing objects:   7% (11/145)   [K
remote: Compressing objects:   8% (12/145)   [K
remote: Compressing objects:   9% (14/145)   [K
remote: Compressing objects:  10% (15/145)   [K
remote: Compressing objects:  11% (16/145)   [K
remote: Compressing objects:  12% (18/145)   [K
remote: Compressing objects:  13% (19/145)   [K
remote: Compressing objects:  14% (21/145)   [K
remote: Compressing objects:  15% (22/145)   [K
remote: Compressing objects:  16% (24/145)   [K
remote: Compressing objects:  17% (25/145)   [K
remote: Compressing objects:  18% (27/145)   [K
remote: Compressing objects:  19% (28/145)   [K
remote: Compressing objects:  20% (29/145)   [K
remote: Compressing objects:  21% (31/145)   [K
remote: Compressing objects:  22% (32/145)   [K
remote: Compressing objects:  23% (34/145)   [K
remote: Compressing objects:  24% (35/145)   [K
remote: Compressing objects:  25% (37/145)   [K
remote: Compressing objects:  26% (38/145)   [K
remote: Compressing objects:  27% (40/145)   [K
remote: Compressing objects:  28% (41/145)   [K
remote: Compressing objects:  29% (43/145)   [K
remote: Compressing objects:  30% (44/145)   [K
remote: Compressing objects:  31% (45/145)   [K
remote: Compressing objects:  32% (47/145)   [K
remote: Compressing objects:  33% (48/145)   [K
remote: Compressing objects:  34% (50/145)   [K
remote: Compressing objects:  35% (51/145)   [K
remote: Compressing objects:  36% (53/145)   [K
remote: Compressing objects:  37% (54/145)   [K
remote: Compressing objects:  38% (56/145)   [K
remote: Compressing objects:  39% (57/145)   [K
remote: Compressing objects:  40% (58/145)   [K
remote: Compressing objects:  41% (60/145)   [K
remote: Compressing objects:  42% (61/145)   [K
remote: Compressing objects:  43% (63/145)   [K
remote: Compressing objects:  44% (64/145)   [K
remote: Compressing objects:  45% (66/145)   [K
remote: Compressing objects:  46% (67/145)   [K
remote: Compressing objects:  47% (69/145)   [K
remote: Compressing objects:  48% (70/145)   [K
remote: Compressing objects:  49% (72/145)   [K
remote: Compressing objects:  50% (73/145)   [K
remote: Compressing objects:  51% (74/145)   [K
remote: Compressing objects:  52% (76/145)   [K
remote: Compressing objects:  53% (77/145)   [K
remote: Compressing objects:  54% (79/145)   [K
remote: Compressing objects:  55% (80/145)   [K
remote: Compressing objects:  56% (82/145)   [K
remote: Compressing objects:  57% (83/145)   [K
remote: Compressing objects:  58% (85/145)   [K
remote: Compressing objects:  59% (86/145)   [K
remote: Compressing objects:  60% (87/145)   [K
remote: Compressing objects:  61% (89/145)   [K
remote: Compressing objects:  62% (90/145)   [K
remote: Compressing objects:  63% (92/145)   [K
remote: Compressing objects:  64% (93/145)   [K
remote: Compressing objects:  65% (95/145)   [K
remote: Compressing objects:  66% (96/145)   [K
remote: Compressing objects:  67% (98/145)   [K
remote: Compressing objects:  68% (99/145)   [K
remote: Compressing objects:  69% (101/145)   [K
remote: Compressing objects:  70% (102/145)   [K
remote: Compressing objects:  71% (103/145)   [K
remote: Compressing objects:  72% (105/145)   [K
remote: Compressing objects:  73% (106/145)   [K
remote: Compressing objects:  74% (108/145)   [K
remote: Compressing objects:  75% (109/145)   [K
remote: Compressing objects:  76% (111/145)   [K
remote: Compressing objects:  77% (112/145)   [K
remote: Compressing objects:  78% (114/145)   [K
remote: Compressing objects:  79% (115/145)   [K
remote: Compressing objects:  80% (116/145)   [K
remote: Compressing objects:  81% (118/145)   [K
remote: Compressing objects:  82% (119/145)   [K
remote: Compressing objects:  83% (121/145)   [K
remote: Compressing objects:  84% (122/145)   [K
remote: Compressing objects:  85% (124/145)   [K
remote: Compressing objects:  86% (125/145)   [K
remote: Compressing objects:  87% (127/145)   [K
remote: Compressing objects:  88% (128/145)   [K
remote: Compressing objects:  89% (130/145)   [K
remote: Compressing objects:  90% (131/145)   [K
remote: Compressing objects:  91% (132/145)   [K
remote: Compressing objects:  92% (134/145)   [K
remote: Compressing objects:  93% (135/145)   [K
remote: Compressing objects:  94% (137/145)   [K
remote: Compressing objects:  95% (138/145)   [K
remote: Compressing objects:  96% (140/145)   [K
remote: Compressing objects:  97% (141/145)   [K
remote: Compressing objects:  98% (143/145)   [K
remote: Compressing objects:  99% (144/145)   [K
remote: Compressing objects: 100% (145/145)   [K
remote: Compressing objects: 100% (145/145), done.[K
Receiving objects:   0% (1/246)
Receiving objects:   1% (3/246)
Receiving objects:   2% (5/246)
Receiving objects:   3% (8/246)
Receiving objects:   4% (10/246)
Receiving objects:   5% (13/246)
Receiving objects:   6% (15/246)
Receiving objects:   7% (18/246)
Receiving objects:   8% (20/246)
Receiving objects:   9% (23/246)
Receiving objects:  10% (25/246)
Receiving objects:  11% (28/246)
Receiving objects:  12% (30/246)
Receiving objects:  13% (32/246)
Receiving objects:  14% (35/246)
Receiving objects:  15% (37/246)
Receiving objects:  16% (40/246)
Receiving objects:  17% (42/246)
Receiving objects:  18% (45/246)
Receiving objects:  19% (47/246)
Receiving objects:  20% (50/246)
Receiving objects:  21% (52/246)
Receiving objects:  22% (55/246)
Receiving objects:  23% (57/246)
Receiving objects:  24% (60/246)
Receiving objects:  25% (62/246)
Receiving objects:  26% (64/246)
Receiving objects:  27% (67/246)
Receiving objects:  28% (69/246)
Receiving objects:  29% (72/246)
Receiving objects:  30% (74/246)
Receiving objects:  31% (77/246)
Receiving objects:  32% (79/246)
Receiving objects:  33% (82/246)
Receiving objects:  34% (84/246)
Receiving objects:  35% (87/246)
Receiving objects:  36% (89/246)
Receiving objects:  37% (92/246)
Receiving objects:  38% (94/246)
Receiving objects:  39% (96/246)
Receiving objects:  40% (99/246)
Receiving objects:  41% (101/246)
Receiving objects:  42% (104/246)
Receiving objects:  43% (106/246)
Receiving objects:  44% (109/246)
Receiving objects:  45% (111/246)
Receiving objects:  46% (114/246)
Receiving objects:  47% (116/246)
Receiving objects:  48% (119/246)
Receiving objects:  49% (121/246)
Receiving objects:  50% (123/246)
Receiving objects:  51% (126/246)
Receiving objects:  52% (128/246)
Receiving objects:  53% (131/246)
Receiving objects:  54% (133/246)
Receiving objects:  55% (136/246)
Receiving objects:  56% (138/246)
Receiving objects:  57% (141/246)
Receiving objects:  58% (143/246)
Receiving objects:  59% (146/246)
Receiving objects:  60% (148/246)
Receiving objects:  61% (151/246)
Receiving objects:  62% (153/246)
Receiving objects:  63% (155/246)
Receiving objects:  64% (158/246)
Receiving objects:  65% (160/246)
Receiving objects:  66% (163/246)
Receiving objects:  67% (165/246)
Receiving objects:  68% (168/246)
Receiving objects:  69% (170/246)
Receiving objects:  70% (173/246)
Receiving objects:  71% (175/246)
Receiving objects:  72% (178/246)
Receiving objects:  73% (180/246)
Receiving objects:  74% (183/246)
Receiving objects:  75% (185/246)
Receiving objects:  76% (187/246)
Receiving objects:  77% (190/246)
Receiving objects:  78% (192/246)
Receiving objects:  79% (195/246)
Receiving objects:  80% (197/246)
Receiving objects:  81% (200/246)
Receiving objects:  82% (202/246)
Receiving objects:  83% (205/246)
Receiving objects:  84% (207/246)
Receiving objects:  85% (210/246)
Receiving objects:  86% (212/246)
Receiving objects:  87% (215/246)
Receiving objects:  88% (217/246)
Receiving objects:  89% (219/246)
Receiving objects:  90% (222/246)
Receiving objects:  91% (224/246)
Receiving objects:  92% (227/246)
Receiving objects:  93% (229/246)
Receiving objects:  94% (232/246)
Receiving objects:  95% (234/246)
remote: Total 246 (delta 130), reused 206 (delta 93), pack-reused 0[K
Receiving objects:  96% (237/246)
Receiving objects:  97% (239/246)
Receiving objects:  98% (242/246)
Receiving objects:  99% (244/246)
Receiving objects: 100% (246/246)
Receiving objects: 100% (246/246), 234.16 KiB | 0 bytes/s, done.
Resolving deltas:   0% (0/130)
Resolving deltas:   8% (11/130)
Resolving deltas:   9% (12/130)
Resolving deltas:  12% (16/130)
Resolving deltas:  13% (17/130)
Resolving deltas:  17% (23/130)
Resolving deltas:  18% (24/130)
Resolving deltas:  22% (29/130)
Resolving deltas:  24% (32/130)
Resolving deltas:  25% (33/130)
Resolving deltas:  27% (36/130)
Resolving deltas:  29% (38/130)
Resolving deltas:  33% (43/130)
Resolving deltas:  34% (45/130)
Resolving deltas:  38% (50/130)
Resolving deltas:  40% (52/130)
Resolving deltas:  42% (55/130)
Resolving deltas:  48% (63/130)
Resolving deltas:  52% (68/130)
Resolving deltas:  53% (69/130)
Resolving deltas:  58% (76/130)
Resolving deltas:  61% (80/130)
Resolving deltas:  62% (81/130)
Resolving deltas:  66% (87/130)
Resolving deltas:  72% (94/130)
Resolving deltas:  73% (95/130)
Resolving deltas:  77% (101/130)
Resolving deltas:  88% (115/130)
Resolving deltas:  94% (123/130)
Resolving deltas:  95% (124/130)
Resolving deltas: 100% (130/130)
Resolving deltas: 100% (130/130), done.
Checking connectivity... done.

travis_time:end:04c88743:start=1463461071149419853,finish=1463461071513984608,duration=364564755
[0K$ cd KamataRyo/embed-travis
$ git checkout -qf f53382501da4f0e918a7ac8b826ae68b57b12921
travis_fold:end:git.checkout
[0K
[33;1mThis job is running on container-based infrastructure, which does not allow use of 'sudo', setuid and setguid executables.[0m
[33;1mIf you require sudo, add 'sudo: required' to your .travis.yml[0m
[33;1mSee https://docs.travis-ci.com/user/workers/container-based-infrastructure/ for details.[0m

[33;1mSetting environment variables from .travis.yml[0m
$ export WP_VERSION_TO_DEPLOY=latest
$ export PHP_VERSION_TO_DEPLOY=5.6
$ export WP_MULTISITE_TO_DEPLOY=0
$ export GH_REF=github.com/KamataRyo/embed-travis.git
$ export WP_VERSION=latest
$ export WP_MULTISITE=0

travis_time:start:0e699de3
[0K$ phpenv global 5.3 2>/dev/null

travis_time:end:0e699de3:start=1463461072914773771,finish=1463461072931039126,duration=16265355
[0Ktravis_time:start:00610ad0
[0K$ phpenv global 5.3

travis_time:end:00610ad0:start=1463461072934405600,finish=1463461072949647388,duration=15241788
[0Ktravis_time:start:08fb6b2c
[0K$ composer self-update
Updating to version [32ma4e8d858ba71995f74622c090c9a523e1d1297ed[39m.
    Downloading: [33mconnection...[39m    Downloading: [33m100%[39m         
Use [32mcomposer self-update --rollback[39m to return to version 1d8f05f1dd0e390f253f79ea86cd505178360019

travis_time:end:08fb6b2c:start=1463461072980666256,finish=1463461074722461860,duration=1741795604
[0K$ php --version
PHP 5.3.29 (cli) (built: Feb 12 2015 00:55:43)
Copyright (c) 1997-2014 The PHP Group
Zend Engine v2.3.0, Copyright (c) 1998-2014 Zend Technologies
    with Xdebug v2.2.7, Copyright (c) 2002-2015, by Derick Rethans
$ composer --version
[30;43mYou are running composer with xdebug enabled. This has a major impact on runtime performance. See https://getcomposer.org/xdebug[39;49m
[32mComposer[39m version [33m1.2-dev (a4e8d858ba71995f74622c090c9a523e1d1297ed)[39m 2016-05-16 17:50:37
[0m
travis_fold:start:before_script.1
[0Ktravis_time:start:1502a404
[0K$ bash bin/install-wp-tests.sh wordpress_test root '' localhost $WP_VERSION
+install_wp
+'[' -d /tmp/wordpress/ ']'
+mkdir -p /tmp/wordpress/
+'[' latest == latest ']'
+local ARCHIVE_NAME=latest
+download https://wordpress.org/latest.tar.gz /tmp/wordpress.tar.gz
++which curl
+'[' /usr/bin/curl ']'
+curl -s https://wordpress.org/latest.tar.gz
+tar --strip-components=1 -zxmf /tmp/wordpress.tar.gz -C /tmp/wordpress/
+download https://raw.github.com/markoheijnen/wp-mysqli/master/db.php /tmp/wordpress//wp-content/db.php
++which curl
+'[' /usr/bin/curl ']'
+curl -s https://raw.github.com/markoheijnen/wp-mysqli/master/db.php
+install_test_suite
++uname -s
+[[ Linux == \D\a\r\w\i\n ]]
+local ioption=-i
+'[' '!' -d /tmp/wordpress-tests-lib ']'
+mkdir -p /tmp/wordpress-tests-lib
+svn co --quiet https://develop.svn.wordpress.org/tags/4.5.2/tests/phpunit/includes/ /tmp/wordpress-tests-lib/includes
+cd /tmp/wordpress-tests-lib
+'[' '!' -f wp-tests-config.php ']'
+download https://develop.svn.wordpress.org/tags/4.5.2/wp-tests-config-sample.php /tmp/wordpress-tests-lib/wp-tests-config.php
++which curl
+'[' /usr/bin/curl ']'
+curl -s https://develop.svn.wordpress.org/tags/4.5.2/wp-tests-config-sample.php
+sed -i 's:dirname( __FILE__ ) . '\''/src/'\'':'\''/tmp/wordpress/'\'':' /tmp/wordpress-tests-lib/wp-tests-config.php
+sed -i s/youremptytestdbnamehere/wordpress_test/ /tmp/wordpress-tests-lib/wp-tests-config.php
+sed -i s/yourusernamehere/root/ /tmp/wordpress-tests-lib/wp-tests-config.php
+sed -i s/yourpasswordhere// /tmp/wordpress-tests-lib/wp-tests-config.php
+sed -i 's|localhost|localhost|' /tmp/wordpress-tests-lib/wp-tests-config.php
+install_db
+PARTS=(${DB_HOST//\:/ })
+local PARTS
+local DB_HOSTNAME=localhost
+local DB_SOCK_OR_PORT=
+local EXTRA=
+'[' -z localhost ']'
++echo
++grep -e '^[0-9]\{1,\}$'
+'[' ']'
+'[' -z ']'
+'[' -z localhost ']'
+EXTRA=' --host=localhost --protocol=tcp'
+mysqladmin create wordpress_test --user=root --password= --host=localhost --protocol=tcp

travis_time:end:1502a404:start=1463461074890153203,finish=1463461079080448479,duration=4190295276
[0Ktravis_fold:end:before_script.1
[0Ktravis_fold:start:before_script.2
[0Ktravis_time:start:1e2e0854
[0K$ npm cache clean

travis_time:end:1e2e0854:start=1463461079083994271,finish=1463461079557139938,duration=473145667
[0Ktravis_fold:end:before_script.2
[0Ktravis_fold:start:before_script.3
[0Ktravis_time:start:0f97c898
[0K$ npm install -g  npm-install-retry
-[0G\[0G/home/travis/.nvm/v0.10.36/bin/npm-install-retry -> /home/travis/.nvm/v0.10.36/lib/node_modules/npm-install-retry/bin/npm-install-retry
npm-install-retry@1.0.2 /home/travis/.nvm/v0.10.36/lib/node_modules/npm-install-retry
├── colors@0.6.2
└── commander@1.1.1 (keypress@0.1.0)
[2K
travis_time:end:0f97c898:start=1463461079560673748,finish=1463461080672436764,duration=1111763016
[0Ktravis_fold:end:before_script.3
[0Ktravis_fold:start:before_script.4
[0Ktravis_time:start:0bf4b618
[0K$ npm-install-retry --wait 500 --attempts 10
[32m[1mattempt 1[22m[39m: npm install
npm WARN deprecated jQuery@1.7.4: This is deprecated. Please use 'jquery' (all lowercase).
npm WARN deprecated graceful-fs@3.0.8: graceful-fs v3.0.0 and before will fail on node releases >= v7.0. Please update to graceful-fs@^4.0.0 as soon as possible. Use 'npm ls graceful-fs' to find it in the tree.
npm WARN deprecated graceful-fs@1.2.3: graceful-fs v3.0.0 and before will fail on node releases >= v7.0. Please update to graceful-fs@^4.0.0 as soon as possible. Use 'npm ls graceful-fs' to find it in the tree.
npm WARN deprecated lodash@1.0.2: lodash@<3.0.0 is no longer maintained. Upgrade to lodash@^4.0.0.
npm WARN deprecated jade@0.26.3: Jade has been renamed to pug, please install the latest version of pug instead of jade
npm WARN deprecated graceful-fs@2.0.3: graceful-fs v3.0.0 and before will fail on node releases >= v7.0. Please update to graceful-fs@^4.0.0 as soon as possible. Use 'npm ls graceful-fs' to find it in the tree.
npm WARN engine escodegen@1.8.0: wanted: {"node":">=0.12.0"} (current: {"node":"0.10.36","npm":"1.4.28"})
npm WARN engine cryptiles@2.0.5: wanted: {"node":">=0.10.40"} (current: {"node":"0.10.36","npm":"1.4.28"})
npm WARN engine boom@2.10.1: wanted: {"node":">=0.10.40"} (current: {"node":"0.10.36","npm":"1.4.28"})
npm WARN engine hoek@2.16.3: wanted: {"node":">=0.10.40"} (current: {"node":"0.10.36","npm":"1.4.28"})

> embed-travis@0.0.0 install /home/travis/build/KamataRyo/embed-travis
> npm run build


> embed-travis@0.0.0 build /home/travis/build/KamataRyo/embed-travis
> ./node_modules/gulp/bin/gulp.js build

[04:58:20] Using gulpfile ~/build/KamataRyo/embed-travis/gulpfile.js
[04:58:20] Starting 'coffee'...
[04:58:20] Finished 'coffee' after 10 ms
[04:58:20] Starting 'gettext'...
[04:58:20] Finished 'gettext' after 2.43 ms
[04:58:20] Starting 'build'...
[04:58:20] Finished 'build' after 13 μs
coffee-script@1.10.0 node_modules/coffee-script

jQuery@1.7.4 node_modules/jQuery

should@8.3.1 node_modules/should
├── should-type@0.2.0
├── should-equal@0.7.2
└── should-format@0.3.2

gulp-plumber@1.1.0 node_modules/gulp-plumber
├── through2@2.0.1 (xtend@4.0.1, readable-stream@2.0.6)
└── gulp-util@3.0.7 (array-differ@1.0.0, array-uniq@1.0.2, lodash._reescape@3.0.0, lodash._reevaluate@3.0.0, lodash._reinterpolate@3.0.0, beeper@1.1.0, object-assign@3.0.0, replace-ext@0.0.1, has-gulplog@0.1.0, fancy-log@1.2.0, vinyl@0.5.3, minimist@1.2.0, gulplog@1.0.0, lodash.template@3.6.2, chalk@1.1.3, multipipe@0.1.2, dateformat@1.0.12)

gulp-sourcemaps@1.6.0 node_modules/gulp-sourcemaps
├── graceful-fs@4.1.4
├── convert-source-map@1.2.0
├── strip-bom@2.0.0 (is-utf8@0.2.1)
├── vinyl@1.1.1 (clone-stats@0.0.1, clone@1.0.2, replace-ext@0.0.1)
└── through2@2.0.1 (xtend@4.0.1, readable-stream@2.0.6)

grunt-wp-i18n@0.5.4 node_modules/grunt-wp-i18n
├── async@0.9.2
├── underscore@1.8.3
├── underscore.string@3.0.3
└── gettext-parser@1.1.2 (encoding@0.1.12)

mocha@2.4.5 node_modules/mocha
├── escape-string-regexp@1.0.2
├── supports-color@1.2.0
├── growl@1.8.1
├── commander@2.3.0
├── diff@1.4.0
├── debug@2.2.0 (ms@0.7.1)
├── mkdirp@0.5.1 (minimist@0.0.8)
├── glob@3.2.3 (graceful-fs@2.0.3, inherits@2.0.1, minimatch@0.2.14)
└── jade@0.26.3 (commander@0.6.1, mkdirp@0.3.0)

gulp@3.9.1 node_modules/gulp
├── interpret@1.0.1
├── pretty-hrtime@1.0.2
├── deprecated@0.0.1
├── archy@1.0.0
├── tildify@1.2.0 (os-homedir@1.0.1)
├── minimist@1.2.0
├── v8flags@2.0.11 (user-home@1.1.1)
├── chalk@1.1.3 (escape-string-regexp@1.0.5, supports-color@2.0.0, ansi-styles@2.2.1, strip-ansi@3.0.1, has-ansi@2.0.0)
├── semver@4.3.6
├── orchestrator@0.3.7 (stream-consume@0.1.0, sequencify@0.0.7, end-of-stream@0.1.5)
├── liftoff@2.2.1 (extend@2.0.1, rechoir@0.6.2, flagged-respawn@0.3.2, resolve@1.1.7, findup-sync@0.3.0)
├── vinyl-fs@0.3.14 (graceful-fs@3.0.8, strip-bom@1.0.0, vinyl@0.4.6, defaults@1.0.3, mkdirp@0.5.1, through2@0.6.5, glob-stream@3.1.18, glob-watcher@0.0.6)
└── gulp-util@3.0.7 (array-differ@1.0.0, array-uniq@1.0.2, beeper@1.1.0, lodash._reevaluate@3.0.0, lodash._reinterpolate@3.0.0, lodash._reescape@3.0.0, object-assign@3.0.0, replace-ext@0.0.1, fancy-log@1.2.0, has-gulplog@0.1.0, gulplog@1.0.0, lodash.template@3.6.2, vinyl@0.5.3, through2@2.0.1, multipipe@0.1.2, dateformat@1.0.12)

gulp-coffee@2.3.2 node_modules/gulp-coffee
├── merge@1.2.0
├── through2@0.6.5 (xtend@4.0.1, readable-stream@1.0.34)
├── vinyl-sourcemaps-apply@0.1.4 (source-map@0.1.43)
└── gulp-util@3.0.7 (array-differ@1.0.0, array-uniq@1.0.2, lodash._reevaluate@3.0.0, lodash._reinterpolate@3.0.0, lodash._reescape@3.0.0, beeper@1.1.0, object-assign@3.0.0, replace-ext@0.0.1, has-gulplog@0.1.0, fancy-log@1.2.0, gulplog@1.0.0, chalk@1.1.3, lodash.template@3.6.2, minimist@1.2.0, vinyl@0.5.3, through2@2.0.1, multipipe@0.1.2, dateformat@1.0.12)

gulp-gettext@0.3.0 node_modules/gulp-gettext
├── gettext-parser@1.1.2 (encoding@0.1.12)
├── through2@2.0.1 (xtend@4.0.1, readable-stream@2.0.6)
└── gulp-util@3.0.7 (array-differ@1.0.0, array-uniq@1.0.2, lodash._reevaluate@3.0.0, lodash._reinterpolate@3.0.0, lodash._reescape@3.0.0, beeper@1.1.0, object-assign@3.0.0, replace-ext@0.0.1, has-gulplog@0.1.0, fancy-log@1.2.0, gulplog@1.0.0, lodash.template@3.6.2, chalk@1.1.3, minimist@1.2.0, vinyl@0.5.3, multipipe@0.1.2, dateformat@1.0.12)

grunt@0.4.5 node_modules/grunt
├── which@1.0.9
├── dateformat@1.0.2-1.2.3
├── eventemitter2@0.4.14
├── getobject@0.1.0
├── rimraf@2.2.8
├── colors@0.6.2
├── async@0.1.22
├── grunt-legacy-util@0.2.0
├── hooker@0.2.3
├── exit@0.1.2
├── nopt@1.0.10 (abbrev@1.0.7)
├── minimatch@0.2.14 (sigmund@1.0.1, lru-cache@2.7.3)
├── glob@3.1.21 (inherits@1.0.2, graceful-fs@1.2.3)
├── lodash@0.9.2
├── coffee-script@1.3.3
├── underscore.string@2.2.1
├── iconv-lite@0.2.11
├── findup-sync@0.1.3 (glob@3.2.11, lodash@2.4.2)
├── js-yaml@2.0.5 (argparse@0.1.16, esprima@1.0.4)
└── grunt-legacy-log@0.1.3 (grunt-legacy-log-utils@0.1.1, underscore.string@2.3.3, lodash@2.4.2)

jsdom@9.1.0 node_modules/jsdom
├── acorn-globals@1.0.9
├── array-equal@1.0.0
├── webidl-conversions@3.0.1
├── abab@1.0.3
├── xml-name-validator@2.0.1
├── sax@1.2.1
├── cssom@0.3.1
├── symbol-tree@3.1.4
├── nwmatcher@1.3.7
├── tough-cookie@2.2.2
├── iconv-lite@0.4.13
├── whatwg-url@2.0.1 (tr46@0.0.3)
├── parse5@1.5.1
├── acorn@2.7.0
├── escodegen@1.8.0 (estraverse@1.9.3, esutils@2.0.2, optionator@0.8.1, esprima@2.7.2, source-map@0.2.0)
├── request@2.72.0 (is-typedarray@1.0.0, oauth-sign@0.8.2, aws-sign2@0.6.0, forever-agent@0.6.1, tunnel-agent@0.4.3, caseless@0.11.0, stringstream@0.0.5, isstream@0.1.2, json-stringify-safe@5.0.1, extend@3.0.0, aws4@1.4.1, node-uuid@1.4.7, combined-stream@1.0.5, qs@6.1.0, mime-types@2.1.11, form-data@1.0.0-rc4, bl@1.1.2, http-signature@1.1.1, hawk@3.1.3, har-validator@2.0.6)
└── cssstyle@0.2.34

gulp-notify@2.2.0 node_modules/gulp-notify
├── node.extend@1.1.5 (is@3.1.0)
├── lodash.template@3.6.2 (lodash._reinterpolate@3.0.0, lodash._basetostring@3.0.1, lodash._basecopy@3.0.1, lodash._basevalues@3.0.0, lodash.templatesettings@3.1.1, lodash.restparam@3.6.1, lodash._isiterateecall@3.0.9, lodash.escape@3.2.0, lodash.keys@3.1.2)
├── through2@0.6.5 (xtend@4.0.1, readable-stream@1.0.34)
├── gulp-util@3.0.7 (array-differ@1.0.0, array-uniq@1.0.2, lodash._reescape@3.0.0, lodash._reevaluate@3.0.0, lodash._reinterpolate@3.0.0, beeper@1.1.0, object-assign@3.0.0, replace-ext@0.0.1, has-gulplog@0.1.0, fancy-log@1.2.0, gulplog@1.0.0, chalk@1.1.3, vinyl@0.5.3, minimist@1.2.0, multipipe@0.1.2, dateformat@1.0.12, through2@2.0.1)
└── node-notifier@4.5.0 (shellwords@0.1.0, growly@1.3.0, minimist@1.2.0, semver@5.1.0, which@1.2.8, lodash.clonedeep@3.0.2, cli-usage@0.1.2)

travis_time:end:0bf4b618:start=1463461080675961970,finish=1463461102023338738,duration=21347376768
[0Ktravis_fold:end:before_script.4
[0Ktravis_fold:start:before_script.5
[0Ktravis_time:start:07e2291d
[0K$ npm run build

> embed-travis@0.0.0 build /home/travis/build/KamataRyo/embed-travis
> ./node_modules/gulp/bin/gulp.js build

[[90m04:58:22[39m] Using gulpfile [35m~/build/KamataRyo/embed-travis/gulpfile.js[39m
[[90m04:58:22[39m] Starting '[36mcoffee[39m'...
[[90m04:58:22[39m] Finished '[36mcoffee[39m' after [35m11 ms[39m
[[90m04:58:22[39m] Starting '[36mgettext[39m'...
[[90m04:58:22[39m] Finished '[36mgettext[39m' after [35m2.79 ms[39m
[[90m04:58:22[39m] Starting '[36mbuild[39m'...
[[90m04:58:22[39m] Finished '[36mbuild[39m' after [35m8.08 μs[39m

travis_time:end:07e2291d:start=1463461102026855850,finish=1463461103105791865,duration=1078936015
[0Ktravis_fold:end:before_script.5
[0Ktravis_time:start:02759a2a
[0K$ npm test

> embed-travis@0.0.0 test /home/travis/build/KamataRyo/embed-travis
> mocha --compilers coffee:coffee-script/register ./tests/test-embed-travis.coffee


/home/travis/build/KamataRyo/embed-travis/js/embed-travis.js:168
  jQuery(document).ready(app);
         ^
ReferenceError: document is not defined
  at Object.<anonymous> (/home/travis/build/KamataRyo/embed-travis/js/embed-travis.js:168:10)
  at Object.<anonymous> (/home/travis/build/KamataRyo/embed-travis/js/embed-travis.js:170:4)
  at Module._compile (module.js:456:26)
  at Object.Module._extensions..js (module.js:474:10)
  at Module.load (/home/travis/build/KamataRyo/embed-travis/node_modules/coffee-script/lib/coffee-script/register.js:45:36)
  at Function.Module._load (module.js:312:12)
  at Module.require (module.js:364:17)
  at require (module.js:380:17)
  at Object.<anonymous> (/home/travis/build/KamataRyo/embed-travis/tests/test-embed-travis.coffee:1:7)
  at Object.<anonymous> (/home/travis/build/KamataRyo/embed-travis/tests/test-embed-travis.coffee:1:1)
  at Module._compile (module.js:456:26)
  at Object.loadFile (/home/travis/build/KamataRyo/embed-travis/node_modules/coffee-script/lib/coffee-script/register.js:16:19)
  at Module.load (/home/travis/build/KamataRyo/embed-travis/node_modules/coffee-script/lib/coffee-script/register.js:45:36)
  at Function.Module._load (module.js:312:12)
  at Module.require (module.js:364:17)
  at require (module.js:380:17)
  at /home/travis/build/KamataRyo/embed-travis/node_modules/mocha/lib/mocha.js:219:27
  at Array.forEach (native)
  at Mocha.loadFiles (/home/travis/build/KamataRyo/embed-travis/node_modules/mocha/lib/mocha.js:216:14)
  at Mocha.run (/home/travis/build/KamataRyo/embed-travis/node_modules/mocha/lib/mocha.js:468:10)
  at Object.<anonymous> (/home/travis/build/KamataRyo/embed-travis/node_modules/mocha/bin/_mocha:403:18)
  at Module._compile (module.js:456:26)
  at Object.Module._extensions..js (module.js:474:10)
  at Module.load (module.js:356:32)
  at Function.Module._load (module.js:312:12)
  at Function.Module.runMain (module.js:497:10)
  at startup (node.js:119:16)
  at node.js:929:3

[37m[40mnpm[0m [0m[31m[40mERR![0m[35m[0m Test failed.  See above for more details.
[0m[37m[40mnpm[0m [0m[31m[40mERR![0m [0m[35mnot ok[0m code 0
[0m
travis_time:end:02759a2a:start=1463461103109255013,finish=1463461103568607314,duration=459352301
[0K
[31;1mThe command "npm test" exited with 1.[0m
travis_time:start:1abe6652
[0K$ phpunit
Installing...
Running as single site... To run multisite, use -c tests/phpunit/multisite.xml
PHP Parse error:  syntax error, unexpected '[' in /home/travis/build/KamataRyo/embed-travis/embed-travis.php on line 114
PHP Stack trace:
PHP   1. {main}() /home/travis/.phpenv/versions/5.3.29/bin/phpunit:0
PHP   2. PHPUnit_TextUI_Command::main() /home/travis/.phpenv/versions/5.3.29/bin/phpunit:722
PHP   3. PHPUnit_TextUI_Command->run() phar:///home/travis/.phpenv/versions/5.3.29/bin/phpunit/phpunit/TextUI/Command.php:104
PHP   4. PHPUnit_TextUI_Command->handleArguments() phar:///home/travis/.phpenv/versions/5.3.29/bin/phpunit/phpunit/TextUI/Command.php:114
PHP   5. PHPUnit_TextUI_Command->handleBootstrap() phar:///home/travis/.phpenv/versions/5.3.29/bin/phpunit/phpunit/TextUI/Command.php:622
PHP   6. PHPUnit_Util_Fileloader::checkAndLoad() phar:///home/travis/.phpenv/versions/5.3.29/bin/phpunit/phpunit/TextUI/Command.php:792
PHP   7. PHPUnit_Util_Fileloader::load() phar:///home/travis/.phpenv/versions/5.3.29/bin/phpunit/phpunit/Util/Fileloader.php:42
PHP   8. include_once() phar:///home/travis/.phpenv/versions/5.3.29/bin/phpunit/phpunit/Util/Fileloader.php:58
PHP   9. require() /home/travis/build/KamataRyo/embed-travis/tests/bootstrap.php:13
PHP  10. require_once() /tmp/wordpress-tests-lib/includes/bootstrap.php:86
PHP  11. do_action() /tmp/wordpress/wp-settings.php:230
PHP  12. call_user_func_array:{/tmp/wordpress/wp-includes/plugin.php:525}() /tmp/wordpress/wp-includes/plugin.php:525
PHP  13. _manually_load_plugin() /tmp/wordpress/wp-includes/plugin.php:525

Parse error: syntax error, unexpected '[' in /home/travis/build/KamataRyo/embed-travis/embed-travis.php on line 114

Call Stack:
    0.0013     816312   1. {main}() /home/travis/.phpenv/versions/5.3.29/bin/phpunit:0
    0.0185    1541216   2. PHPUnit_TextUI_Command::main() /home/travis/.phpenv/versions/5.3.29/bin/phpunit:722
    0.0185    1541968   3. PHPUnit_TextUI_Command->run() phar:///home/travis/.phpenv/versions/5.3.29/bin/phpunit/phpunit/TextUI/Command.php:104
    0.0185    1541968   4. PHPUnit_TextUI_Command->handleArguments() phar:///home/travis/.phpenv/versions/5.3.29/bin/phpunit/phpunit/TextUI/Command.php:114
    0.0224    2271032   5. PHPUnit_TextUI_Command->handleBootstrap() phar:///home/travis/.phpenv/versions/5.3.29/bin/phpunit/phpunit/TextUI/Command.php:622
    0.0225    2287536   6. PHPUnit_Util_Fileloader::checkAndLoad() phar:///home/travis/.phpenv/versions/5.3.29/bin/phpunit/phpunit/TextUI/Command.php:792
    0.0225    2287664   7. PHPUnit_Util_Fileloader::load() phar:///home/travis/.phpenv/versions/5.3.29/bin/phpunit/phpunit/Util/Fileloader.php:42
    0.0226    2295112   8. include_once('/home/travis/build/KamataRyo/embed-travis/tests/bootstrap.php') phar:///home/travis/.phpenv/versions/5.3.29/bin/phpunit/phpunit/Util/Fileloader.php:58
    0.0232    2445728   9. require('/tmp/wordpress-tests-lib/includes/bootstrap.php') /home/travis/build/KamataRyo/embed-travis/tests/bootstrap.php:13
    0.5271    3964072  10. require_once('/tmp/wordpress/wp-settings.php') /tmp/wordpress-tests-lib/includes/bootstrap.php:86
    0.6387   34560328  11. do_action() /tmp/wordpress/wp-settings.php:230
    0.6388   34561880  12. call_user_func_array:{/tmp/wordpress/wp-includes/plugin.php:525}() /tmp/wordpress/wp-includes/plugin.php:525
    0.6388   34561912  13. _manually_load_plugin() /tmp/wordpress/wp-includes/plugin.php:525


travis_time:end:1abe6652:start=1463461103572167766,finish=1463461104282210927,duration=710043161
[0K
[31;1mThe command "phpunit" exited with 255.[0m

Done. Your build exited with 1.
###

should = require 'should'
ESC = String.fromCharCode 27
CR = String.fromCharCode 13

{ ansi2Html, formatLines } = require '../js/embed-travis'

styleSets =
    34: {dir34:'val34'}
    33: {dir33:'val33'}
    1: {dir1_1:'val1_1',dir1_2:'val1_2'}
    0: {dir0:'val0'}


describe 'test of ansi2Html', ->

    it 'should not style up without escape code', ->
        content = 'Linux Version'
        line = "[34m[1m#{content}[0m"

        ansi2Html line, styleSets
            .should.exactly "[34m[1m#{content}[0m"


    it 'should style up terminal color code', ->
        content = 'Linux Version'
        line = "#{ESC}[34m#{content}#{ESC}[0m"

        ansi2Html line, styleSets
            .should.exactly "<span style=\"dir34:val34\">#{content}<span style=\"dir0:val0\"></span></span>"


    it 'should style up terminal color code', ->
        content = 'Linux Version'
        line = "#{ESC}[34m#{ESC}[1m#{content}#{ESC}[0m"

        ansi2Html line, styleSets
            .should.exactly "<span style=\"dir34:val34\"><span style=\"dir1_1:val1_1;dir1_2:val1_2\">#{content}<span style=\"dir0:val0\"></span></span></span>"


    it 'should style up terminal color code', ->
        content = 'content'
        line = "#{ESC}[33;1m#{content}#{ESC}[0m"

        ansi2Html line, styleSets
            .should.exactly "<span style=\"dir33:val33\"><span style=\"dir1_1:val1_1;dir1_2:val1_2\">#{content}<span style=\"dir0:val0\"></span></span></span>"


describe 'test of formatLines, parseTravis', ->

    it 'should format lines', ->
        lines = "abc\ndefghi\njklmn"
        formatLines lines
            .should.exactly '<p><a>1</a>abc</p><p><a>2</a>defghi</p><p><a>3</a>jklmn</p>'


    for action in ['fold', 'time']
        for state in ['start', 'end']

            it "should detect travisCI grammer '#{action}-#{state}'", ->
                lines = "abc\ntravis_#{action}:#{state}:label#{CR}#{ESC}[0K\njklmn"
                formatLines lines
                    .should.exactly "<p><a>1</a>abc</p><p data-#{action}-#{state}=\"label\"><a>2</a></p><p><a>3</a>jklmn</p>"


            it "should parse travisCI grammer '#{action}-#{state}'", ->
                lines = "abc\ntravis_#{action}:#{state}:label#{CR}#{ESC}[0K\njklmn"
                formatLines lines
