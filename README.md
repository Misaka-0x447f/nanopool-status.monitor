<del>个人用ETH/ETC控制面板</del>

an ETH/ETC/XMR/ZEC(nanopool) mining monitor that could be run on any phone that support morden browser.

Screenshot

![bandicam 2017-10-23 22-31-48-849_1_1](https://user-images.githubusercontent.com/15797507/31895131-ed970f32-b842-11e7-9471-5b9936c77c40.gif)

Full-screen flash 3 times every 15 seconds means current hashrate is zero. Please check your miner.

![image](https://user-images.githubusercontent.com/15797507/31890671-838443dc-b836-11e7-97b1-976ad1a6d49d.png)

a red digit means this value was not able to update due to network or other reason.

![image](https://user-images.githubusercontent.com/15797507/31891000-a00b5396-b837-11e7-8ecc-b87061cbb381.png)

a darker blue digit means this value is being update.

the progress bar indicated time until next update.

## env requirement
php7.1

php7.1-curl

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

`specify module update interval. unit: minute. recommended value: 3..10`

`nanopool limited requests rate to 30 per minute.`

noUpdateTimerBar

`true: hide update timer bar.`

## run
open index.php on your <del>chrome</del> browser

## how to select profile that defined in config file
/index.php

↑ This will select profile 'default'

/index.php&config=default

↑ You can specify profile using get
