<?php
/**
 * Created by PhpStorm.
 * User: Aozak
 * Date: 2017/10/2
 * Time: 22:14
 */

class debugConsoleOpt{
    static private $enableDebugOutput = false;
    static private $enableDebugOutputToLogFile = false;
    static private $scriptStartTime;
    static private function getRunTimerF(){
        //return a string that formatted as unix format
        return number_format(microtime(true) - debugConsoleOpt::$scriptStartTime,6);
    }
    static public function setScriptStartTime($time){
        debugConsoleOpt::$scriptStartTime = $time;
    }
    static public function err($string){
        if(error_reporting() != 0){
            debugConsoleOpt::info("Warning: " . $string);
        }//else{
        //enable when debugging
        //console::intInfo("Silenced Warning: " . $string);
        //console::toLogFileWithTimeStamp("Silenced Warning: " . $string);
        //}
        return true;
    }

    static public function info($string){
        $string = str_replace(" ", "&nbsp;", $string);
        if(debugConsoleOpt::$enableDebugOutput === true){
            echo "<br/>" . debugConsoleOpt::getRunTimerF() . "&nbsp;" . $string;
        }
        if(debugConsoleOpt::$enableDebugOutputToLogFile === true){
            debugConsoleOpt::toLogFileWithTimeStamp($string);
        }
        return true;
    }

    static public function stop($string){
        debugConsoleOpt::info($string);
        exit;
    }

    static function netStatus($ch){
        $sto = curl_getinfo($ch);
        debugConsoleOpt::info("    Target URL          " . $sto["url"]);
        debugConsoleOpt::info("    Status code         " . $sto["http_code"]);
        debugConsoleOpt::info("    Network traffic     " . "↓ " . $sto["size_download"] / 1024 . " KiB "
            . "↑ " . $sto["size_upload"] / 1024 . " KiB ");
        debugConsoleOpt::info("    Timing              ");
        debugConsoleOpt::info("        Total time      " . $sto["total_time"]);
        debugConsoleOpt::info("        Name lookup     " . $sto["namelookup_time"]);
        debugConsoleOpt::info("        Redirect        " . $sto["redirect_time"]);
        debugConsoleOpt::info("        Connecting      " . $sto["connect_time"]);
        debugConsoleOpt::info("        Start transfer  " . $sto["starttransfer_time"]);
        debugConsoleOpt::info("    Content type        " . $sto["content_type"]);
    }

    static function toLogFileWithTimeStamp($string){
        $logFileOpt = @new fileOpt();
        @$logFileOpt->fileSelect("temp/latest.log");
        if(!@$logFileOpt->fileExist() or @$logFileOpt->fileEmpty()){
            if(!@$logFileOpt->fileExist()){
                @$logFileOpt->fileCreate();
            }
            for($i = 0 ; $i < 30 ; $i++){
                @$logFileOpt->jsonFileWrite((string)($i), "empty");
            }
        }
        for($i = 28 ; $i >= 0 ; $i--){
            //1.read $i
            @$info = $logFileOpt->jsonFileRead((string)$i);
            if($info === false){
                //wipe down log file
                @$logFileOpt->fileUnlink();
            }
            //2.write to $i+1
            @$logFileOpt->jsonFileWrite((string)($i+1), $info);
        }
        @$logFileOpt->jsonFileWrite("0", debugConsoleOpt::getRunTimerF() . " " . $string);
        return true;
    }
}