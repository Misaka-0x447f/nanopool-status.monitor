<?php
/**
 * Created by PhpStorm.
 * User: Aozak
 * Date: 2017/9/24
 * Time: 17:23
 */
require("../lib/fileOpt.php");
require("../lib/debugConsoleOpt.php");
require("../lib/webOpt.php");
class nanopoolEtcEth{
    public $typeOfApi;
    //set-able var
    public $minerAddress; //"0x" is optional.
    //int var
    private $webOpt;
    private $fileOpt;
    function __construct($type = "etc", $address = null){
        $this->typeOfApi = $type;
        $this->minerAddress = $address;
        $this->webOpt = new webOpt();
        $this->fileOpt = new fileOpt();
        $this->fileOpt->fileSelect("access.counter");
        $this->fileOpt->fileCreate();
        if($this->fileOpt->fileEmpty()){
            $this->fileOpt->jsonFileOverwrite(Array(
                "lastResetTime" => time(),
                "counter" => 0
            ));
        }
    }

    public function minerGeneralInfo(){
        $paraValid = $this->presetParameterValid();
        if($paraValid !== true){
            return $paraValid;
        }

        $this->counterPlusOne();
        if($this->isOverUsed()){
            return $this->error("400.5");
        }

        $result = $this->webOpt->post(array(
            "url" => "https://api.nanopool.org/v1/" . $this->typeOfApi . "/user/" . $this->minerAddress
        ));
        $rawResult = $result;
        $result = json_decode($result, true);
        $checkResult = $this->checkResult($result, $rawResult);
        if($checkResult !== true){
            return $checkResult;
        }
        if($result["status"] === false){
            if($result["error"] === "Account not found"){
                return $this->error("404.1");
            }else{
                return $this->unknownResult($result);
            }
        }
        if($result["status"] === true){
            unset($result["status"]);
            return $this->ok("200.8", $result);
        }
        return $this->error("500.0");
    }
    public function minerAccountBalance(){
        $paraValid = $this->presetParameterValid();
        if($paraValid !== true){
            return $paraValid;
        }
        if($this->isOverUsed()){
            return $this->error("400.5");
        }
        $result = $this->webOpt->post(array(
            "url" => "https://api.nanopool.org/v1/" . $this->typeOfApi . "/balance/" . $this->minerAddress
        ));
        $this->counterPlusOne();
        $rawResult = $result;
        $result = json_decode($result, true);
        $checkResult = $this->checkResult($result, $rawResult);

        if($checkResult !== true){
            return $checkResult;
        }
        if($result["status"] === false){
            if($result["error"] === "Account not found"){
                return $this->error("404.1");
            }else{
                return $this->unknownResult($result);
            }
        }
        if($result["status"] === true){
            unset($result["status"]);
            return $this->ok("200.1", $result);
        }
        return $this->error("500.0");
    }
    public function minerAverageHashrate(int $hours = 6){
        $paraValid = $this->presetParameterValid();
        if($paraValid !== true){
            return $paraValid;
        }

        $this->counterPlusOne();
        if($this->isOverUsed()){
            return $this->error("400.5");
        }

        $result = $this->webOpt->post(array(
            "url" => "https://api.nanopool.org/v1/" . $this->typeOfApi . "/avghashratelimited/" . $this->minerAddress . "/" . $hours
        ));

        $rawResult = $result;
        $result = json_decode($result, true);
        $checkResult = $this->checkResult($result, $rawResult);

        if($checkResult !== true){
            return $checkResult;
        }
        if($result["status"] === false){
            return $this->unknownResult($result);
        }
        if($result["status"] === true){
            unset($result["status"]);
            return $this->ok("200.2", $result);
        }
        return $this->error("500.0");
    }
    public function minerHashrate(){
        $paraValid = $this->presetParameterValid();
        if($paraValid !== true){
            return $paraValid;
        }

        $this->counterPlusOne();
        if($this->isOverUsed()){
            return $this->error("400.5");
        }

        $result = $this->webOpt->post(array(
            "url" => "https://api.nanopool.org/v1/" . $this->typeOfApi . "/hashrate/" . $this->minerAddress
        ));

        $rawResult = $result;
        $result = json_decode($result, true);
        $checkResult = $this->checkResult($result, $rawResult);

        if($checkResult !== true){
            return $checkResult;
        }
        if($result["status"] === false){
            if($result["error"] === "Account not found"){
                return $this->error("404.1");
            }else{
                return $this->unknownResult($result);
            }
        }
        if($result["status"] === true){
            unset($result["status"]);
            return $this->ok("200.3", $result);
        }
        return $this->error("500.0");
    }
    public function minerHashrateHistory(){
        $paraValid = $this->presetParameterValid();
        if($paraValid !== true){
            return $paraValid;
        }

        $this->counterPlusOne();
        if($this->isOverUsed()){
            return $this->error("400.5");
        }

        $result = $this->webOpt->post(array(
            "url" => "https://api.nanopool.org/v1/" . $this->typeOfApi . "/history/" . $this->minerAddress
        ));

        $rawResult = $result;
        $result = json_decode($result, true);
        $checkResult = $this->checkResult($result, $rawResult);

        if($checkResult !== true){
            return $checkResult;
        }
        if($result["status"] === false){
            return $this->unknownResult($result);
        }
        if($result["status"] === true){
            unset($result["status"]);
            return $this->ok("200.7", $result);
        }
        return $this->error("500.0");
    }
    public function minerEstimatedEarnings(string $hashrates = null){
        if($hashrates === null){
            return $this->error("400.3");
        }

        $this->counterPlusOne();
        if($this->isOverUsed()){
            return $this->error("400.5");
        }

        $paraValid = $this->presetParameterValid();
        if($paraValid !== true){
            return $paraValid;
        }
        $result = $this->webOpt->post(array(
            "url" => "https://api.nanopool.org/v1/" . $this->typeOfApi . "/approximated_earnings/" . $hashrates
        ));

        $rawResult = $result;
        $result = json_decode($result, true);
        $checkResult = $this->checkResult($result, $rawResult);

        if($checkResult !== true){
            return $checkResult;
        }
        if($result["status"] === false){
            if($result["error"] === "Bad request params"){
                return $this->error("400.4", $hashrates);
            }else{
                return $this->unknownResult($result);
            }
        }
        if($result["status"] === true){
            unset($result["status"]);
            return $this->ok("200.4", $result);
        }
        return $this->error("500.0");
    }
    public function minerPayments(){
        $paraValid = $this->presetParameterValid();
        if($paraValid !== true){
            return $paraValid;
        }

        $this->counterPlusOne();
        if($this->isOverUsed()){
            return $this->error("400.5");
        }

        $result = $this->webOpt->post(array(
            "url" => "https://api.nanopool.org/v1/" . $this->typeOfApi . "/payments/" . $this->minerAddress
        ));

        $rawResult = $result;
        $result = json_decode($result, true);
        $checkResult = $this->checkResult($result, $rawResult);

        if($checkResult !== true){
            return $checkResult;
        }
        if($result["status"] === false){
            return $this->unknownResult($result);
        }
        if($result["status"] === true){
            unset($result["status"]);
            $sum = 0;
            foreach($result["data"] as $value){
                $sum += $value["amount"];
            }
            $result["sum"] = $sum;
            return $this->ok("200.5", $result);
        }
        return $this->error("500.0");
    }
    public function prices(){

        $this->counterPlusOne();
        if($this->isOverUsed()){
            return $this->error("400.5");
        }

        $result = $this->webOpt->post(array(
            "url" => "https://api.nanopool.org/v1/" . $this->typeOfApi . "/prices"
        ));

        $rawResult = $result;
        $result = json_decode($result, true);
        $checkResult = $this->checkResult($result, $rawResult);

        if($checkResult !== true){
            return $checkResult;
        }
        if($result["status"] === false){
            return $this->unknownResult($result);
        }
        if($result["status"] === true){
            unset($result["status"]);
            return $this->ok("200.6", $result);
        }
        return $this->error("500.0");
    }



    private function counterPlusOne(){
        $value = $this->fileOpt->jsonFileRead("counter");
        $value += 1;
        $this->fileOpt->jsonFileWrite("counter", $value);
    }
    private function isOverUsed(){
        $this->checkMinutePassed();
        if($this->fileOpt->jsonFileRead("counter") >= 15){
            return true;
        }
        return false;
    }
    private function checkMinutePassed(){
        if(time() - $this->fileOpt->jsonFileRead("lastResetTime") > 60){
            $this->fileOpt->jsonFileWrite("lastResetTime", time());
            $this->fileOpt->jsonFileWrite("counter", 0);
            return true;
        }
        return false;
    }
    function __destruct(){
        unset($this->webOpt);
        unset($this->minerAddress);
        unset($this->fileOpt);
    }
    private function presetParameterValid(){
        if(!is_string($this->minerAddress)){
            return $this->error("400.1", array(
                "address" => $this->minerAddress,
                "type" => gettype($this->minerAddress)
            ));
        }
        if($this->typeOfApi !== "etc" and $this->typeOfApi !== "eth" and $this->typeOfApi !== "zec" and $this->typeOfApi !== "xmr"){
            return $this->error("400.2");
        }
        return true;
    }
    private function ok(string $statusNo, $information = null){
        $data["status"] = "ok";
        $data["statusNo"] = $statusNo;
        if($statusNo === "200.1"){
            $data["balance"] = (string)$information["data"];
        }
        if($statusNo === "200.2"){
            $data["avgHashrate"] = (string)$information["data"];
        }
        if($statusNo === "200.3"){
            $data["hashrate"] = (string)$information["data"];
        }
        if($statusNo === "200.4"){
            $data["estimatedEarnings"] = $information["data"];
        }
        if($statusNo === "200.5"){
            $data["payments"] = $information["data"];
            $data["sum"] = $information["sum"];
        }
        if($statusNo === "200.6"){
            $data["prices"] = $information["data"];
        }
        if($statusNo === "200.7"){
            $data["hashrateHistory"] = $information["data"];
        }
        if($statusNo === "200.8"){
            $data["data"] = $information["data"];
        }
        if(empty($data)){
            return $this->error("500.-1");
        }
        return $data;
    }
    private function error(string $statusNo = "500.0", $information = null){
        $data["status"] = "interrupted";
        $data["statusNo"] = $statusNo;
        if($statusNo === "400.0"){
            $data["message"] = "bad request. params may invalid in api interface.";
        }
        if($statusNo === "400.1"){
            $data["message"] = "miner address was not valid. current address is " . $information["address"]
                             . ", address data type is " . $information["type"];
        }
        if($statusNo === "400.2"){
            $data["message"] = "invalid mine type. mine type must be 'etc', 'eth', 'zec' or 'xmr'.";
        }
        if($statusNo === "400.3"){
            $data["message"] = "bad request. hashrate is required.";
        }
        if($statusNo === "400.4"){
            $data["message"] = "bad request. params may invalid. param is " . $information;
        }
        if($statusNo === "400.5"){
            $requests = $this->fileOpt->jsonFileRead("counter");
            $data["message"] = "the api was over used in recent one minute. " . $requests . " of 15 requests was made recently. cool down required.";
        }
        if($statusNo === "404.1"){
            $data["message"] = "miner address was not found on pool server";
        }
        if($statusNo === "500.-1"){
            $data["message"] = "internal server error";
        }
        if($statusNo === "500.1"){
            $data["message"] = "cannot parse result returned by pool server. raw value is " . $information;
        }
        if($statusNo === "500.2"){
            $data["message"] = "unexpected result returned by pool server. raw value is " . $information;
            $data["result"] = $information;
        }
        if($statusNo === "500.3"){ //pool server unknown error
            $data["message"] = $information;
        }
        if(empty($data)){
            $data["message"] = "undefined internal server error";
        }
        return $data;
    }
    private function checkResult($result, $rawResult){
        if($result === null){
            return $this->error("500.1", $rawResult);
        }
        if(!is_bool($result["status"])){
            return $this->error("500.2", $rawResult);
        }
        return true;
    }
    private function unknownResult(array $result){
        unset($result["status"]);
        if(count($result) === 1){
            return $this->error("500.3", reset($result));
        }else{
            return $this->error("500.3", $result);
        }
    }
}