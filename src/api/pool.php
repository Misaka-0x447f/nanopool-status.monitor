<?php
/**
 * Created by PhpStorm.
 * User: Aozak
 * Date: 2017/9/24
 * Time: 17:23
 */
require("functions.php");
class nanopool{
    //set-able var
    public $minerAddress; //"0x" is optional.
    //int var
    private $webOpt;
    function __construct(string $address){
        $this->minerAddress = $address;
        $this->webOpt = new webOpt();
    }
    public function minerAccountBalance(){
        if(!$this->presetParameterValid()){
            return $this->error("400.1");
        }
        $result = $this->webOpt->post(array(
            "url" => "https://api.nanopool.org/v1/eth/balance/" . $this->minerAddress
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
    function __destruct(){
        unset($this->webOpt);
        unset($this->minerAddress);
    }
    private function presetParameterValid(){
        if(is_string($this->minerAddress)){
            return true;
        }
        return false;
    }
    private function ok(string $statusNo, $information = null){
        $data["status"] = "ok";
        $data["statusNo"] = $statusNo;
        if($statusNo === "200.1"){
            $data["balance"] = (string)$information["data"];
        }
        if(empty($data)){
            return $this->error("500.-1");
        }
        return $data;
    }
    private function error(string $statusNo = "500.0", $information = null){
        $data["status"] = "interrupted";
        $data["statusNo"] = $statusNo;
        if($statusNo === "400.1"){
            $data["message"] = "miner address was not valid";
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