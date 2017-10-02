<?php
/**
 * Created by PhpStorm.
 * User: Aozak
 * Date: 2017/9/24
 * Time: 21:00
 */
require("pool.php");
$coinType = $_GET["coinType"];
$address = $_GET["address"];
$dataType = $_GET["dataType"];
$speed = $_GET["speed"];
$avgRange = 6;
if(isset($_GET["avgRange"])){
    $avgRange = $_GET["avgRange"];
}
//error control located in pool.php

$poolOpt = new nanopoolEtcEth($coinType, $address);
if($dataType === "balance_hashrate"){
    exit(json_encode($poolOpt->minerBalanceAndHashrate()));
}
if($dataType === "balance"){
    exit(json_encode($poolOpt->minerAccountBalance()));
}
if($dataType === "hashrate"){
    exit(json_encode($poolOpt->minerHashrate()));
}
if($dataType === "hashrateHistory"){
    exit(json_encode($poolOpt->minerHashrateHistory()));

}
if($dataType === "avgHashrate"){
    exit(json_encode($poolOpt->minerAverageHashrate($avgRange)));
}
if($dataType === "estimatedEarnings" and isset($speed) and (int)$speed > 0){
    exit(json_encode($poolOpt->minerEstimatedEarnings($speed)));
}
if($dataType === "estimatedEarnings" and isset($speed) and (int)$speed <= 0){
    exit('
    {
        "status":"ok",
        "statusNo":"200.4",
        "estimatedEarnings":{
            "minute":{
                "coins":0,
                "dollars":0,
                "yuan":0,
                "euros":0,
                "rubles":0,
                "bitcoins":0
            },
            "hour":{
                "coins":0,
                "dollars":0,
                "yuan":0,
                "euros":0,
                "rubles":0,
                "bitcoins":0
            },
            "day":{
                "coins":0,
                "dollars":0,
                "yuan":0,
                "euros":0,
                "rubles":0,
                "bitcoins":0
            },
            "week":{
                "coins":0,
                "dollars":0,
                "yuan":0,
                "euros":0,
                "rubles":0,
                "bitcoins":0
            },
            "month":{
                "coins":0,
                "dollars":0,
                "yuan":0,
                "euros":0,
                "rubles":0,
                "bitcoins":0
            }
        }
    }
    ');
}
if($dataType === "payments"){
    exit(json_encode($poolOpt->minerPayments()));
}
if($dataType === "prices"){
    exit(json_encode($poolOpt->prices()));
}
exit("{\"status\":\"interrupted\",\"statusNo\":\"400.0\",\"message\":\"bad request. params may invalid in interface.\"}");