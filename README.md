<del>个人用ETH/ETC控制面板</del>

Screenshot

![image](https://user-images.githubusercontent.com/15797507/31890671-838443dc-b836-11e7-97b1-976ad1a6d49d.png)

![image](https://user-images.githubusercontent.com/15797507/31891000-a00b5396-b837-11e7-8ecc-b87061cbb381.png)

an ETH/ETC/XMR/ZEC(nanopool) mining monitor that could be run on any phone that support morden browser.

## env requirement
php 7.1

nanopool.org

## deployment
cp /src yourServer

## configure
configExample.json is the config file for this program.

you should do this to make config file before run.

`cp configExample.json config.json`

### params
param with * is required

coinType     *

`can be "etc", "eth", "xmr" or "zec"`

address      *

`your wallet address`

priceUnit

`can be "cny", "usd", "eur", "rur" or "btc".`

`come from nanopool.org`

avgRange

`work with module "avgHashrate".`

`specify average hashrate range. unit: hour.`

updateInterval

`specify module update interval. unit: minute.`

noUpdateTimerBar

`true: hide update timer bar.`

## run
open index.php on your <del>chrome</del> browser

## how to select profile that defined in config file
/index.php

↑ This will select profile 'default'

/index.php&config=default

↑ You can specify profile using get
