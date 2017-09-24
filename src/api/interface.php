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
$balance = $_GET["balance"];
$period = 6;
if(isset($_GET["period"])){
    $period = $_GET["period"];
}
//error control located in pool.php

$poolOpt = new nanopoolEtcEth($coinType, $address);
if($dataType === "balance"){
    exit(json_encode($poolOpt->minerAccountBalance()));
}
if($dataType === "hashrate"){
    exit(json_encode($poolOpt->minerAccountBalance()));
}
if($dataType === "avgHashrate"){
    exit(json_encode($poolOpt->minerAverageHashrate($period)));
}
if($dataType === "estimatedEarnings"){
    exit(json_encode($poolOpt->minerEstimatedEarnings($balance)));
}
exit("{\"status\":\"interrupted\",\"statusNo\":\"400.0\",\"message\":\"bad request. params may invalid.\"}");