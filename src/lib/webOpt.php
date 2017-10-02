<?php
/**
 * Created by PhpStorm.
 * User: Aozak
 * Date: 2017/10/2
 * Time: 22:15
 */

class webOpt{
    private $ch;
    function __construct(){
        $this->ch = curl_init();
    }
    function __destruct()
    {
        curl_close($this->ch);
    }
    public function post($argArray){
        if(count($argArray) == 1 and isset($argArray["url"])){
            return $this->simple_post($argArray["url"]);
        }else{
            throw new Exception("webOp.post error：invalid argument");
        }
    }
    private function simple_post($url){
        curl_setopt_array($this->ch, array(
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true
        ));
        debugConsoleOpt::netStatus($this->ch);
        return curl_exec($this->ch);
    }
}