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
            return $this->error("400/1");
        }
        $result = $this->webOpt->post(array(
            "url" => "https://api.nanopool.org/v1/eth/balance/" . $this->minerAddress
        ));
        $result = json_decode($result);
        $checkResult = $this->checkResult($result);
        if($checkResult !== true){
            return $checkResult;
        }
        if($result->status === false){
            if($result->error === "Account not found"){
                return $this->error("404/1");
            }else{
                return $this->unknownResult($result);
            }
        }
        if($result->status === true){
            return $this->ok("200/1", $result->data);
        }
        return $this->error("500/0");
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
    private function ok(string $dataStructureNo, object $information){
        if($dataStructureNo === "200/1"){
            $data = array(
                "status" => "ok",
                "balance" => (string)$information->balance
            );
        }
        if(empty($data)){
            return $this->error("500/-1");
        }
        $data["status"] = "ok";
        return (object)$data;
    }
    private function error(string $errNo, mixed $information = null){
        if($errNo === "400/1"){
            $data = array(
                "message" => "miner address was not valid"
            );
        }
        if($errNo === "404/1"){
            $data = array(
                "message" => "miner address was not found on pool server"
            );
        }
        if($errNo === "500/-1"){
            $data = array(
                "message" => "internal server error"
            );
        }
        if($errNo === "500/1"){
            $data = array(
                "message" => "cannot parse result returned by pool server"
            );
        }
        if($errNo === "500/2"){
            $data = array(
                "message" => "unexpected result returned by pool server"
            );
        }
        if($errNo === "500/3"){ //pool server unknown error
            $data = array(
                "message" => $information
            );
        }
        if(empty($data)){
            $errNo = "500/0";
            $data = array(
                "message" => "undefined internal server error"
            );
        }
        $data["status"] = "interrupted";
        $data["errNo"] = $errNo;
        return (object)$data;
    }
    private function checkResult(object $result){
        if($result === null){
            return $this->error("500/1");
        }
        if(empty($result->status) or !($result->status === false or $result->status === true)){
            return $this->error("500/2");
        }
        return true;
    }
    private function unknownResult(object $result){
        $result = (array)$result;
        unset($result["status"]);
        if(count($result) === 1){
            return $this->error("500/3", reset($result));
        }else{
            return $this->error("500/3", $result);
        }
    }
}