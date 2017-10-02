<?php
/**
 * Created by PhpStorm.
 * User: Aozak
 * Date: 2017/10/2
 * Time: 22:13
 */

class fileOpt{
    /*
     * do fileSelect/Read/Write/Create/Unlink and check Exist
     */
    private $fileName;
    private $filePointer;
    public function fileSelect($fileName){
        $this->fileName = $fileName;
    }
    private function fileOpen($mode){
        /*
         * file read modes:
         *
         * r  Read  only at BOF
         * w  Write only at BOF / Create if not exist / Erase if exist
         * a  Write only at EOF / Create if not exist
         * x  Create and Write only at BOF / On exist return false and show warning
         * c  Create and Write only at BOF
         *
         * r+ Read write at BOF
         * w+ Read write at BOF / Create if not exist / Erase if exist
         * a+ Read write at EOF / Create if not exist
         * x+ Create and Read write at BOF / On exist return false and show warning
         * c+ Create and Read write at BOF
         */
        $this->filePointer = fopen($this->fileName, $mode);
        if(!$this->filePointer){
            if($this->fileExist()){
                debugConsoleOpt::err("failed to open file \"" . $this->fileName . "\" in mode \"".$mode."\"");
            }else{
                debugConsoleOpt::err("failed to open file \"" . $this->fileName . "\" in mode \"".$mode."\": file does not exist");
            }
            return false;
        }
        return $this->filePointer;
    }
    private function fileClose(){
        if(!fclose($this->filePointer)){
            debugConsoleOpt::err("failed to close file \"" . $this->fileName . "\"");
            return false;
        }
        return true;
    }
    public function fileRead(){
        if(!$this->fileExist()){
            debugConsoleOpt::err("\"" . $this->fileName . "\" does not exist in file system");
            return false;
        }
        $file = $this->fileOpen("r");
        if($file === false){
            debugConsoleOpt::err("\"" . $this->fileName . "\" cannot be read from file system.123123");
            return false;
        }
        if($this->fileEmpty()){
            debugConsoleOpt::info("reading file \"" . $this->fileName . "\" is empty.");
            return "";
        }
        $fileContent = fread($file, filesize($this->fileName));
        if($fileContent === false){
            debugConsoleOpt::err("file content is false");
        }

        $this->fileClose();
        if($fileContent === false){
            debugConsoleOpt::err("failed to read file " . $this->fileName);
        }
        return $fileContent;
    }
    public function jsonFileRead($targetName = false){
        if(($fileReadContent = $this->fileRead()) !== false){
            if($fileReadContent === ""){
                return "";
            }
            if(NULL === json_decode($fileReadContent)){
                debugConsoleOpt::err("json cannot be decode");
                return false;
            }
            if($targetName === false){
                return json_decode($fileReadContent);
            }else{
                return json_decode($fileReadContent)->$targetName;
            }
        }
        return false;
    }
    public function jsonFileOverwrite($contentArray){
        if(!is_object($contentArray) and !is_array($contentArray)){
            debugConsoleOpt::err("Cannot write file \"" . $this->fileName . "\": not an object or array");
            return false;
        }
        $this->fileOverwrite(json_encode($contentArray));
        return true;
    }
    public function jsonFileWrite($name, $value){
        if(($someArray = $this->jsonFileRead()) === false){
            debugConsoleOpt::err("Cannot read file \"" . $this->fileName . "\" in json format: content is \"" . $someArray . "\"");
        }

        @$someArray->$name = (string)$value;
        $this->jsonFileOverwrite($someArray);
        return true;
    }
    public function jsonFileHasOwnProperty($key){
        return !is_null(((array)$this->jsonFileRead())[$key]);
    }
    public function fileOverwrite($content){
        if(!$this->fileExist()){
            return false;
        }
        $file = $this->fileOpen("w");
        if($file === false){
            return false;
        }
        $writeCount = fwrite($file, $content);
        $this->fileClose();
        if($writeCount === false){
            debugConsoleOpt::err("failed to write file " . $this->fileName);
            return false;
        }
        if($writeCount != strlen($content)){
            debugConsoleOpt::err(strlen($content) . "byte write excepted, " . $writeCount . "written");
        }
        return $writeCount;
    }
    public function fileEmpty(){
        clearstatcache();
        if(!$this->fileExist()){
            return false;
        }
        if(filesize($this->fileName) === 0){
            return true;
        }
        return false;
    }
    public function fileExist(){
        clearstatcache();
        return file_exists($this->fileName);
    }
    public function fileCreate(){
        $result = @$this->fileOpen("x"); //error control
        @$this->fileClose();
        return $result;
    }
    public function fileUnlink(){
        return unlink($this->fileName);
    }
    public function fileLockRO(){
        $fp = $this->fileOpen("r+");
        return flock($fp, LOCK_EX);
    }
    public function fileLocked(){
        $fp = @$this->fileOpen("r+");
        @stream_set_blocking($fp, 0);
        if($fp === false){
            //file not exist, terminated
            return false;
        }
        if(!flock($fp, LOCK_EX|LOCK_NB, $wouldBlock)){
            if($wouldBlock){
                // another process holds the lock
                return true;
            }else{
                // couldn't lock for another reason, e.g. no such file
                return false;
            }
        }else{
            // lock obtained
            flock($fp, LOCK_UN);
            return false;
        }
    }
    public function getFileLines(){
        $counter = 1;
        $filePointer = $this->fileOpen("r");
        while(!feof($filePointer)){
            $line = fgets($filePointer, 4096);
            $counter = $counter + substr_count($line, PHP_EOL);
        }
        $this->fileClose();
        return $counter;
    }
    public function getFileContentsByLineNumber($lineNumber){
        //$lineNumber is 1-based
        $file = new SplFileObject($this->fileName);
        $file->seek($lineNumber - 1); // seek to line $lineNumber - 1 (0-based)
        return $file->current();
    }
}