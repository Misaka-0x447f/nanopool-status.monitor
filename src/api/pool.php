<?php
/**
 * Created by PhpStorm.
 * User: Aozak
 * Date: 2017/9/24
 * Time: 17:23
 */
require("functions.php");
class nanopoolEtcEth{
    public $typeOfApi;
    //set-able var
    public $minerAddress; //"0x" is optional.
    //int var
    private $webOpt;
    function __construct(string $type = "etc", string $address = null){
        $this->typeOfApi = $type;
        $this->minerAddress = $address;
        $this->webOpt = new webOpt();
    }


    public function minerAccountBalance(){
        $paraValid = $this->presetParameterValid();
        if($paraValid !== true){
            return $paraValid;
        }
        $result = $this->webOpt->post(array(
            "url" => "https://api.nanopool.org/v1/" . $this->typeOfApi . "/balance/" . $this->minerAddress
        ));
        $result = json_decode($result, true);
        $checkResult = $this->checkResult($result);

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
        $result = $this->webOpt->post(array(
            "url" => "https://api.nanopool.org/v1/" . $this->typeOfApi . "/avghashratelimited/" . $this->minerAddress . "/" . $hours
        ));
        $result = json_decode($result, true);
        $checkResult = $this->checkResult($result);

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
        $result = $this->webOpt->post(array(
            "url" => "https://api.nanopool.org/v1/" . $this->typeOfApi . "/hashrate/" . $this->minerAddress
        ));
        $result = json_decode($result, true);
        $checkResult = $this->checkResult($result);

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
    public function minerEstimatedEarnings(string $hashrates){
        $paraValid = $this->presetParameterValid();
        if($paraValid !== true){
            return $paraValid;
        }
        $result = $this->webOpt->post(array(
            "url" => "https://api.nanopool.org/v1/" . $this->typeOfApi . "/approximated_earnings/" . $hashrates
        ));
        $result = json_decode($result, true);
        $checkResult = $this->checkResult($result);

        if($checkResult !== true){
            return $checkResult;
        }
        if($result["status"] === false){
            if($result["error"] === "Bad request params"){
                return $this->error("400.0");
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


    function __destruct(){
        unset($this->webOpt);
        unset($this->minerAddress);
    }
    private function presetParameterValid(){
        if(!is_string($this->minerAddress)){
            return $this->error("400.1", array(
                "address" => $this->minerAddress,
                "type" => gettype($this->minerAddress)
            ));
        }
        if($this->typeOfApi !== "etc" and $this->typeOfApi !== "eth"){
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
            $data["estimatedEarns"] = $information["data"];
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
            $data["message"] = "bad request. params may invalid.";
        }
        if($statusNo === "400.1"){
            $data["message"] = "miner address was not valid. current address is " . $information["address"]
                             . ", address data type is " . $information["type"];
        }
        if($statusNo === "400.2"){
            $data["message"] = "invalid mine type. mine type must be 'etc' or 'eth'.";
        }
        if($statusNo === "404.1"){
            $data["message"] = "miner address was not found on pool server";
        }
        if($statusNo === "500.-1"){
            $data["message"] = "internal server error";
        }
        if($statusNo === "500.1"){
            $data["message"] = "cannot parse result returned by pool server";
        }
        if($statusNo === "500.2"){
            $data["message"] = "unexpected result returned by pool server";
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
    private function checkResult($result){
        if($result === null){
            return $this->error("500.1");
        }
        if(!is_bool($result["status"])){
            return $this->error("500.2", $result);
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